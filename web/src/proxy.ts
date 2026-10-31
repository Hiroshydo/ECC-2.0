import { NextResponse, type NextRequest } from "next/server";

const isPublicPath = (pathname: string) =>
  pathname === "/login" ||
  pathname.startsWith("/api/health") ||
  pathname.startsWith("/api/auth/") ||
  pathname.startsWith("/_next") ||
  pathname === "/favicon.ico";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (isPublicPath(pathname) || request.cookies.has("ecclesia_session")) {
    return NextResponse.next({ request });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
