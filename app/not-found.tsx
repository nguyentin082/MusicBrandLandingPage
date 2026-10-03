import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getNotFoundCopy, NotFoundContent } from '@/components/common/not-found-content';
import { detectDefaultLocale } from '@/lib/locale';

export const metadata: Metadata = {
    title: '404',
};

// Paths outside /en and /vi land here. There is no locale in the URL, so pick
// one the same way the root redirect does.
export default async function RootNotFound() {
    const locale = detectDefaultLocale(await headers());
    const copy = await getNotFoundCopy(locale);

    return (
        <main
            lang={locale}
            className="flex min-h-screen items-center justify-center bg-dark-umber px-4 py-12 text-off-white selection:bg-warm-gold/30 sm:px-10"
        >
            <div className="w-full max-w-5xl">
                <NotFoundContent locale={locale} copy={copy} />
            </div>
        </main>
    );
}
