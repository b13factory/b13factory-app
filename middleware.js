import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  
  // Get the Supabase auth token from cookies
  const authToken = req.cookies.get('sb-gigszmpljitrksgsinrm-auth-token')?.value
  
  // Check if user has a session by checking for auth token
  const hasSession = !!authToken

  // If accessing protected routes without session, redirect to login
  if (!hasSession && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // If accessing login page with session, redirect to dashboard
  // This will be handled client-side in the login page for better UX
  // if (hasSession && req.nextUrl.pathname === '/') {
  //   return NextResponse.redirect(new URL('/dashboard', req.url))
  // }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
}