import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getRequestAuth } from "@/lib/auth/request";

export const runtime = "nodejs";

/** Yönetici menüyü değiştirince ana sayfa, QR menü ve sipariş sayfası hemen yenilenir */
export async function POST(request: Request) {
  const auth = await getRequestAuth(request);
  if (auth.role !== "admin") return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  revalidatePath("/");
  revalidatePath("/qr-menu");
  revalidatePath("/siparis");
  return NextResponse.json({ ok: true });
}
