import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, getMessages, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import { StickyContactFab } from '@/components/common/sticky-contact-fab';
import { siteConfig } from '@/lib/site';

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
        alternates: {
            canonical: `/${lang}`,
            languages: {
                en: '/en',
                vi: '/vi',
                'x-default': '/en',
            },
        },
        openGraph: {
            title: t('title'),
            description: t('description'),
            type: 'website',
            url: `${siteConfig.url}/${lang}`,
            siteName: siteConfig.name,
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

    setRequestLocale(lang);

    const [messages, contactFabT] = await Promise.all([
        getMessages({ locale: lang }),
        getTranslations({ locale: lang, namespace: 'contactFab' }),
    ]);

    const contactFabLabels = {
        call: contactFabT('labels.call'),
        sms: contactFabT('labels.sms'),
        zalo: contactFabT('labels.zalo'),
        facebook: contactFabT('labels.facebook'),
        instagram: contactFabT('labels.instagram'),
        telegram: contactFabT('labels.telegram'),
    };

    return (
        <NextIntlClientProvider messages={messages} locale={lang}>
            {children}
            <StickyContactFab labels={contactFabLabels} />
        </NextIntlClientProvider>
    );
}
