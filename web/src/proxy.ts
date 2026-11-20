import { NextResponse, type NextRequest } from "next/server";

const isPublicPath = (pathname: string) =>
  pathname === "/login" ||
  pathname === "/api/health" ||
  pathname.startsWith("/api/auth/") ||
  pathname.startsWith("/_next") ||
  pathname === "/favicon.ico";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (isPublicPath(pathname)) return NextResponse.next({ request });
  if (!request.cookies.has("ecc_session")) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
