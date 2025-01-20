import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["pl", "en"];
const defaultLocale = "pl";

// Dodaj publiczne trasy
const publicRoutes = [
  "/login", 
  "/sign-up", 
  "/", 
  "/api/debug"  // jeśli chcesz, żeby była publicznie dostępna
];

function getLocale(pathname: string): string {
  const locale = pathname.split('/')[1];
  return locales.includes(locale) ? locale : defaultLocale;
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = new URL(request.url);
  const locale = getLocale(pathname);

  // Sprawdź czy to publiczna trasa
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Reszta twojego kodu pozostaje bez zmian
  // Jeśli brakuje locale, przekieruj
  if (!locales.includes(locale)) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
  }

  // Pobierz sesję
  const session = await auth();

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do strony logowania
  if (session?.userId && pathname.includes('/login')) {
    const userRole = (session.sessionClaims?.metadata as { role?: string })?.role || 'student';
    return NextResponse.redirect(new URL(`/${locale}/${userRole}`, request.url));
  }

  // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej strony
  if (!session?.userId && !pathname.includes('/login')) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return NextResponse.next();
}, {
  // Opcjonalna konfiguracja Clerk
  debug: process.env.NODE_ENV !== 'production'
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};