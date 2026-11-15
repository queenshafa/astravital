import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Refreshes the Supabase session and sends logged-out visitors to /login.
export async function proxy(request) {
  if (!URL_ || !KEY) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(URL_, KEY, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith("/login") || path.startsWith("/auth");

  const redirect = (to) => {
    const u = request.nextUrl.clone();
    u.pathname = to; u.search = "";
    const r = NextResponse.redirect(u);
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  // /api/* answers with 401 itself, so it is not redirected
  if (!user && !isAuthPage && !path.startsWith("/api")) return redirect("/login");
  if (user && path.startsWith("/login")) return redirect("/");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|glb|ico)$).*)"],
};
