import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

interface NextRequestWithAuth extends NextRequest {
    nextauth: {
        token: {
            accessToken: string;
        };
    };
}

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const path = request.nextUrl.pathname;

    const PUBLIC_ROUTES = ['/auth/login', '/reset-password', '/email-reset-senha'];

    if (PUBLIC_ROUTES.includes(path)) {
        return NextResponse.next(); // Libera acesso sem redirecionar
    }

    if (path.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // Default behavior do NextAuth
    const authMiddleware = (await import('next-auth/middleware')).default;
    return authMiddleware(request as NextRequestWithAuth);
}
export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*', '/perfil/:path*'], // só rotas privadas
};