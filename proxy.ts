import { updateSession } from "@/lib/supabase/proxy";

import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow Stripe webhook and draw calculation API routes
  // to reach their API routes directly without authentication redirects.
  if (
    pathname.startsWith("/api/checkout/draw/webhooks") ||
    pathname.startsWith("/api/checkout/webhooks") ||
    pathname.startsWith("/api/checkout/draw/calculate-winners")
  ) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|api/checkout/webhooks|api/checkout/draw/webhooks).*)",
  ],
};