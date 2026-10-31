import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { HOME_BY_ROLE } from "@/modules/core/canaa/types";
import { updateSession } from "@/lib/supabase/middleware";

const ROLE_ALIASES: Record<string, string> = {
  dev_master: "dev_master",
  "dev-master": "dev_master",
  pastor_local: "pastor_local",
  "pastor-local": "pastor_local",
  local_pastor: "pastor_local",
  tesoureiro: "tesoureiro",
  treasurer: "tesoureiro",
  secretario: "secretario",
  secretary: "secretario",
};

const isPublicPath = (pathname: string) => pathname === "/login" || pathname.startsWith("/_next") || pathname.startsWith("/api/health") || pathname === "/favicon.ico";

export async function proxy(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return;
  }

  const response = await updateSession(request);
  if (isPublicPath(request.nextUrl.pathname)) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value });
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return response;
  }

  const role = String(user.user_metadata?.role ?? "").toLowerCase();
  const normalizedRole = ROLE_ALIASES[role] ?? (user.email?.toLowerCase() === "renanmarianosd@hotmail.com" ? "dev_master" : "tesoureiro");
  const pathname = request.nextUrl.pathname;

  if (pathname === "/") {
    const destination = HOME_BY_ROLE[normalizedRole as keyof typeof HOME_BY_ROLE] ?? "/";
    if (destination !== "/") {
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return response;
  }

  if (pathname.startsWith("/noah-ops") && normalizedRole !== "dev_master") {
    return NextResponse.redirect(new URL(HOME_BY_ROLE.pastor_local ?? "/", request.url));
  }

  if (pathname.startsWith("/canaa") && normalizedRole !== "dev_master" && normalizedRole !== "pastor_local") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
