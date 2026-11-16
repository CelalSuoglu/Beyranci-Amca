import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Sayfa koruması (görünüm katmanı). Asıl yetki kontrolü veritabanı kuralları (RLS)
 * ve API'lerde yapılır; burası yetkisiz kişiyi doğru sayfaya yönlendirir.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isKitchenLogin = pathname === "/mutfak/giris";
  const isKitchen = pathname.startsWith("/mutfak") && !isKitchenLogin;
  const isAdmin = pathname.startsWith("/yonetim");
  const isAccount = pathname.startsWith("/hesabim");
  const isAuthPage = pathname === "/giris" || pathname === "/kayit";

  const { supabaseResponse, user, role, configured } = await updateSession(
    request,
    isKitchen || isAdmin || isKitchenLogin,
  );

  const redirect = (path: string, params?: Record<string, string>) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);
    return NextResponse.redirect(url);
  };

  if (!configured) {
    if (isKitchen || isAdmin || isAccount) return redirect("/mutfak/giris", { error: "config" });
    return supabaseResponse;
  }

  if (isKitchen || isAdmin) {
    if (!user) return redirect(isKitchen ? "/mutfak/giris" : "/giris", { next: pathname + search });
    if (isAdmin && role !== "admin") return redirect("/", { error: "yetki" });
    if (isKitchen && role !== "staff" && role !== "admin") return redirect("/mutfak/giris", { error: "yetki" });
  }

  if (isKitchenLogin && user && (role === "staff" || role === "admin")) {
    return redirect("/mutfak");
  }

  if (isAccount && !user) return redirect("/giris", { next: pathname + search });
  if (isAuthPage && user) return redirect("/hesabim");

  return supabaseResponse;
}

export const config = {
  matcher: ["/mutfak/:path*", "/yonetim/:path*", "/hesabim/:path*", "/giris", "/kayit"],
};
