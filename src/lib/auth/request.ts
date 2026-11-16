import { createClient as createSupabaseClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { createClient as createCookieClient } from "@/lib/supabase/server";
import type { AppRole } from "./roles";

export type RequestAuth = {
  user: User | null;
  role: AppRole | null;
  /** Kullanıcının kendi yetkisiyle çalışan istemci (RLS geçerli) */
  client: SupabaseClient;
};

/**
 * Web (çerez) veya mobil (Authorization: Bearer) isteğinden kullanıcıyı ve rolünü bulur.
 * Rol her zaman veritabanından okunur; istemcinin gönderdiği hiçbir şeye güvenilmez.
 */
export async function getRequestAuth(request: Request): Promise<RequestAuth> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase yapılandırması eksik.");

  const header = request.headers.get("authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";

  let client: SupabaseClient;
  let user: User | null = null;

  if (bearer) {
    client = createSupabaseClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${bearer}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await client.auth.getUser(bearer);
    user = data.user ?? null;
  } else {
    client = (await createCookieClient()) as unknown as SupabaseClient;
    const { data } = await client.auth.getUser();
    user = data.user ?? null;
  }

  let role: AppRole | null = null;
  if (user) {
    const { data } = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
    role = (data?.role as AppRole | undefined) ?? "customer";
  }

  return { user, role, client };
}
