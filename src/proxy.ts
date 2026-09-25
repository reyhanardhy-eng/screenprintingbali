import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ADMIN_PATHS = new Set([
  "/admin/login",
  "/admin/setup",
  "/admin/reset-password",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();
  const hasSessionCookie = Boolean(
    request.cookies.get("__Host-spb_session")?.value ||
    request.cookies.get("spb_session")?.value
  );
  if (hasSessionCookie) return NextResponse.next();

  const login = request.nextUrl.clone();
  login.pathname = "/admin/login";
  login.search = "";
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
