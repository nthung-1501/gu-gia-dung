import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.json({ error: error ?? 'No code received' }, { status: 400 })
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`

  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: 'Token exchange failed', detail: data }, { status: 400 })
  }

  // Display token so user can copy it to .env
  return NextResponse.json({
    message: 'Copy TIKTOK_ACCESS_TOKEN below to your .env and Railway env vars',
    TIKTOK_ACCESS_TOKEN: data.access_token,
    expires_in: data.expires_in,
    refresh_token: data.refresh_token,
    scope: data.scope,
  })
}
