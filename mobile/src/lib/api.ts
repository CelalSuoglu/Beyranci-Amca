import { supabase } from "./supabase";

/** Web sitesi = sistemin sunucusu. Sipariş, durum ve hesap işlemleri buradan yapılır. */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || "https://beyranciamca.com").replace(/\/$/, "");

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

  try {
    const res = await fetch(`${API_URL}${path}`, { ...init, headers });
    const body = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
    if (!res.ok) {
      return { ok: false, status: res.status, error: body?.error ?? "İşlem tamamlanamadı." };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, status: 0, error: "Bağlantı kurulamadı. İnternetinizi kontrol edin." };
  }
}

export function newIdempotencyKey(): string {
  const rnd = () => Math.random().toString(36).slice(2, 10);
  return `m-${Date.now().toString(36)}-${rnd()}-${rnd()}`;
}
