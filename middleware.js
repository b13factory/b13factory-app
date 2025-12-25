import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;
  
  // Create Supabase client for middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials missing in middleware');
    // Allow access to login page even if credentials are missing
    if (pathname === '/login') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // Update both request and response cookies
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          // Remove from both request and response
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    // Get user session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error in middleware:', error);
    }
    
    const hasSession = !!session;

    console.log(`Middleware: ${pathname}, hasSession: ${hasSession}`);

    // Jika user belum login dan bukan di halaman login, redirect ke login
    if (!hasSession && pathname !== '/login') {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Jika user sudah login dan akses halaman login, redirect ke dashboard
    if (hasSession && pathname === '/login') {
      const dashboardUrl = new URL('/', req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow access to login page
    if (pathname === '/login') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Matcher configuration: hanya jalankan middleware untuk app routes
// Exclude static files, images, dan Next.js internals
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (public assets)
     * - manifest.json, sw.js, workbox-*.js (PWA files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf)$|sw.js|workbox-.*\.js|manifest.json).*)',
  ],
};