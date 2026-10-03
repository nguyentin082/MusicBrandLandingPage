export type SiteLocale = 'en' | 'vi';

// Visitors in Vietnam, or whose browser prefers Vietnamese, get the Vietnamese
// site; everyone else gets English.
export function detectDefaultLocale(requestHeaders: Headers): SiteLocale {
    const country = requestHeaders.get('x-vercel-ip-country')?.toUpperCase();
    if (country === 'VN') {
        return 'vi';
    }

    const acceptLanguage = requestHeaders.get('accept-language')?.toLowerCase();
    if (acceptLanguage?.startsWith('vi')) {
        return 'vi';
    }

    return 'en';
}
