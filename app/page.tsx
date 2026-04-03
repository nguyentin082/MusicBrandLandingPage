import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

function detectDefaultLocale(requestHeaders: Headers) {
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

export default async function RootPage() {
    const requestHeaders = await headers();
    redirect(`/${detectDefaultLocale(requestHeaders)}`);
}
