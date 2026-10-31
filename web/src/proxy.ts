import { NextResponse, type NextRequest } from "next/server";

import { isMasterAdmin } from "@/domain/access";
import { updateSession } from "@/lib/supabase/middleware";

const isPublicPath = (pathname: string) => pathname === "/login" || pathname.startsWith("/api/health") || pathname.startsWith("/_next") || pathname === "/favicon.ico";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return isPublicPath(pathname)
      ? NextResponse.next({ request })
      : NextResponse.redirect(new URL("/login", request.url));
  }

  const { response, user } = await updateSession(request);
  if (isPublicPath(pathname)) return response;

  if (!user) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (pathname === "/" && isMasterAdmin(user)) {
    const redirectResponse = NextResponse.redirect(new URL("/noah-ops", request.url));
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
