import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { detectDefaultLocale } from '@/lib/locale';

export default async function RootPage() {
    const requestHeaders = await headers();
    redirect(`/${detectDefaultLocale(requestHeaders)}`);
}
