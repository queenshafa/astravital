import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Email-confirmation link lands here: exchange the code for a session, then go to the dashboard.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/`);
  }
  return NextResponse.redirect(`${origin}/login?error=confirmation`);
}
