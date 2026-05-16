import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export async function GET(request: NextRequest) {
  const origin = getSiteUrl(request);
  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (data.url) {
    return NextResponse.redirect(data.url);
  }

  return NextResponse.redirect(new URL("/", origin));
}
