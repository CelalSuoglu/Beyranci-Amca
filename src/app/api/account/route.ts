import { NextResponse } from "next/server";
import { getRequestAuth } from "@/lib/auth/request";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Hesap silme (App Store kuralı 5.1.1(v) gereği uygulama içinden yapılabilmeli).
 * Profil, adresler ve bildirim anahtarları silinir. Geçmiş siparişler işletme kaydı olarak
 * kalır ancak hesapla bağlantısı kaldırılır.
 */
export async function DELETE(request: Request) {
  const auth = await getRequestAuth(request);
  if (!auth.user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }
  if (auth.role === "admin") {
    return NextResponse.json(
      { error: "Yönetici hesabı silinemez. Önce başka bir yönetici atayıp rolünüzü değiştirin." },
      { status: 409 },
    );
  }

  const { error } = await createAdminClient().auth.admin.deleteUser(auth.user.id);
  if (error) {
    return NextResponse.json({ error: "Hesap silinemedi. Lütfen tekrar deneyin." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
