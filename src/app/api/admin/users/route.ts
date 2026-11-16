import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestAuth } from "@/lib/auth/request";
import { APP_ROLES } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin(request: Request) {
  const auth = await getRequestAuth(request);
  if (!auth.user) return { error: NextResponse.json({ error: "Giriş gerekli." }, { status: 401 }) };
  if (auth.role !== "admin") return { error: NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 }) };
  return { auth };
}

/** Kullanıcı listesi (e-posta auth tablosunda olduğu için sunucuda birleştirilir) */
export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().toLocaleLowerCase("tr-TR");
  const admin = createAdminClient();

  const { data: listed, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return NextResponse.json({ error: "Kullanıcılar alınamadı." }, { status: 500 });

  const { data: profiles } = await admin.from("profiles").select("id, full_name, phone, role");
  const byId = new Map((profiles ?? []).map((p) => [p.id as string, p]));

  const users = listed.users
    .map((u) => {
      const p = byId.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        fullName: (p?.full_name as string | null) ?? null,
        phone: (p?.phone as string | null) ?? null,
        role: (p?.role as string | undefined) ?? "customer",
        confirmed: Boolean(u.email_confirmed_at),
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
      };
    })
    .filter((u) =>
      !q ||
      u.email.toLowerCase().includes(q) ||
      (u.fullName ?? "").toLocaleLowerCase("tr-TR").includes(q) ||
      (u.phone ?? "").includes(q),
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json({ users });
}

const patchSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(APP_ROLES),
});

/** Rol değiştirme — yalnızca yönetici */
export async function PATCH(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  const { userId, role } = parsed.data;

  const admin = createAdminClient();

  // Son yöneticinin yetkisi alınamaz (sistem yöneticisiz kalmasın)
  if (role !== "admin") {
    const { data: target } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
    if (target?.role === "admin") {
      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) {
        return NextResponse.json({ error: "Son yöneticinin yetkisi kaldırılamaz." }, { status: 409 });
      }
    }
  }

  const { error } = await admin
    .from("profiles")
    .upsert({ id: userId, role }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: "Rol güncellenemedi." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
