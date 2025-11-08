import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  
  // Cek beberapa nama cookie yang mungkin dipakai Supabase
  const cookieNamesToCheck = [
    '__Host-sb-access-token',
    'sb-access-token',
    'sb-refresh-token',
    'sb-gigszmpljitrksgsinrm-auth-token', // tetap ada sebagai fallback jika memang dipakai
  ]

  let hasSession = false

  // Cek daftar nama cookie secara eksplisit
  for (const name of cookieNamesToCheck) {
    if (req.cookies.get(name)?.value) {
      hasSession = true
      break
    }
  }

  // Fallback: cek apakah ada cookie yang berawalan sb- atau __Host-sb-
  if (!hasSession) {
    const cookieHeader = req.headers.get('cookie') || ''
    if (
      cookieHeader
        .split(';')
        .some((c) => c.trim().startsWith('sb-') || c.trim().startsWith('__Host-sb-'))
    ) {
      hasSession = true
    }
  }

  // Proteksi route /dashboard
  if (!hasSession && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
