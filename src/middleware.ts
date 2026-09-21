import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isKitchenRoute = pathname.startsWith("/mutfak");
  const isKitchenLogin = pathname === "/mutfak/giris";

  const { supabaseResponse, user, configured } = await updateSession(request);

  if (!isKitchenRoute) {
    return supabaseResponse;
  }

  if (!configured) {
    if (isKitchenLogin) {
      return supabaseResponse;
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/mutfak/giris";
    loginUrl.searchParams.set("error", "config");
    return NextResponse.redirect(loginUrl);
  }

  if (!user && !isKitchenLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/mutfak/giris";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isKitchenLogin) {
    const panelUrl = request.nextUrl.clone();
    panelUrl.pathname = "/mutfak";
    panelUrl.search = "";
    return NextResponse.redirect(panelUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/mutfak/:path*"],
};
