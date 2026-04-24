import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Must match the secret in lib/auth.ts
const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "foodstore-secret-key-2024";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get token from request
  const token = await getToken({
    req,
    secret: AUTH_SECRET,
  });

  // DEBUG: Log token info (remove in production)
  console.log("[Middleware] Path:", pathname);
  console.log("[Middleware] Token:", token ? "exists" : "null");
  console.log("[Middleware] Token role:", token?.role);
  console.log("[Middleware] Token email:", token?.email);

  const isAuthenticated = !!token;
  const isAdmin = token?.role === "admin";

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    console.log("[Middleware] Checking /admin access");
    console.log("[Middleware] isAuthenticated:", isAuthenticated);
    console.log("[Middleware] isAdmin:", isAdmin);

    // Not logged in → redirect to login
    if (!isAuthenticated) {
      console.log("[Middleware] Redirecting to login (not authenticated)");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Logged in but not admin → redirect to homepage
    if (!isAdmin) {
      console.log("[Middleware] Redirecting to / (not admin)");
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Admin → allow access
    console.log("[Middleware] Allowing admin access");
    return NextResponse.next();
  }

  // Protect /checkout - must be logged in
  if (pathname === "/checkout") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login?redirect=/checkout", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout", "/admin/:path*"],
};
