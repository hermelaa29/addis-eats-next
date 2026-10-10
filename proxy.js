import { NextResponse } from 'next/server';

export default function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get('admin_session');
    
    if (!session || session.value !== 'valid_admin') {
      const userSession = request.cookies.get('user_session');
      if (userSession && userSession.value === 'valid_user') {
        const url = request.nextUrl.clone();
        url.pathname = '/unauthorized';
        return NextResponse.redirect(url);
      }

      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
