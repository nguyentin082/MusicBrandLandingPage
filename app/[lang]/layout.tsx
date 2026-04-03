import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

const locales = ['en', 'vi'];

export async function generateStaticParams() {
    return locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}): Promise<Metadata> {
    const { lang } = await params;
    const t = await getTranslations({ locale: lang, namespace: 'metadata' });

    return {
        title: t('title'),
        description: t('description'),
        openGraph: {
            title: t('title'),
            description: t('description'),
            type: 'website',
            locale: lang === 'vi' ? 'vi_VN' : 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('description'),
        },
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    if (!locales.includes(lang)) notFound();

    const messages = await getMessages({ locale: lang });

    return (
        <NextIntlClientProvider messages={messages} locale={lang}>
            {children}
        </NextIntlClientProvider>
    );
}
