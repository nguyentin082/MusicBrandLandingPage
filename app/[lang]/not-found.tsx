import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { getNotFoundCopy, NotFoundContent } from '@/components/common/not-found-content';

export const metadata: Metadata = {
    title: '404',
};

// Rendered for any notFound() inside /[lang], including unknown blog slugs and
// unmatched paths caught by [...rest], so it keeps the site header and footer.
export default async function LocaleNotFound() {
    const locale = (await getLocale()) === 'vi' ? 'vi' : 'en';
    const copy = await getNotFoundCopy(locale);

    return (
        <div className="min-h-screen bg-off-white dark:bg-dark-umber text-dark-umber dark:text-off-white selection:bg-brick-red/30 dark:selection:bg-warm-gold/30">
            <Header />
            <main className="pt-32 pb-24 px-6 sm:px-10 lg:px-16">
                <div className="mx-auto max-w-5xl">
                    <NotFoundContent locale={locale} copy={copy} />
                </div>
            </main>
            <Footer />
        </div>
    );
}
