import { redirect } from 'next/navigation'

export async function GET() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`
  const scope = 'user.info.basic,video.upload,video.publish'
  const state = crypto.randomUUID()

  const url = new URL('https://www.tiktok.com/v2/auth/authorize')
  url.searchParams.set('client_key', clientKey)
  url.searchParams.set('scope', scope)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)

  redirect(url.toString())
}
