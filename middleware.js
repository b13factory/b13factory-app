import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()

  // Cari cookie yang mungkin berisi session dari Supabase.
  const cookieNamesToCheck = [
    '__Host-sb-access-token',
    'sb-access-token',
    'sb-refresh-token',
    'sb-gigszmpljitrksgsinrm-auth-token', // project ref Supabase kamu
  ]

  let hasSession = false

  // Cek beberapa nama cookie spesifik
  for (const name of cookieNamesToCheck) {
    if (req.cookies.get(name)?.value) {
      hasSession = true
      break
    }
  }

  // Jika belum ketemu, cek apakah ada cookie yang berawalan "sb-" atau "__Host-sb-"
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

  // Jika user belum login dan mencoba akses /dashboard, redirect ke login page
  if (!hasSession && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

// Jalankan middleware hanya untuk route dashboard
export const config = {
  matcher: ['/dashboard/:path*'],
}
