import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";

export async function GET(request: NextRequest) {
  const origin = getSiteUrl(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const discordId =
          user.identities?.[0]?.id || user.user_metadata?.provider_id;
        const username =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "user";
        const avatarUrl = user.user_metadata?.avatar_url;

        if (discordId) {
          const admin = createAdminClient();
          await admin.from("users").upsert(
            {
              discord_id: discordId,
              username,
              avatar_url: avatarUrl,
            },
            { onConflict: "discord_id" },
          );
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
