import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const nextParam = requestUrl.searchParams.get("next") ?? "/member"

  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/member"

  if (!code) {
    return NextResponse.redirect(
      new URL("/?login_error=missing_code", requestUrl.origin)
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("OAuth session exchange failed:", error)

    return NextResponse.redirect(
      new URL("/?login_error=session_exchange", requestUrl.origin)
    )
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
