import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'vi'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
