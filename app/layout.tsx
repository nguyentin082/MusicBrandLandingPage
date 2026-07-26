import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, IBM_Plex_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/theme-provider';
import { siteConfig } from '@/lib/site';
import './globals.css';

const sansFont = Be_Vietnam_Pro({
    subsets: ['latin', 'vietnamese'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-geist-sans',
    display: 'swap',
});
const monoFont = IBM_Plex_Mono({
    subsets: ['latin', 'latin-ext'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-geist-mono',
    display: 'swap',
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#FDFBF7' },
        { media: '(prefers-color-scheme: dark)', color: '#1A1614' },
    ],
};

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    verification: {
        google: 'your-google-site-verification-code', // Add your Google Search Console verification code here
    },
    keywords: [
        // English
        'recording studio',
        'mixing',
        'mastering',
        'Vietnam',
        'Ho Chi Minh City',
        'music production',
        'sound studio',
        '2LAB',
        '2lab studio',
        // Tiếng Việt
        'phòng thu âm',
        'phòng thu âm TPHCM',
        'phòng thu âm chuyên nghiệp',
        'thu âm giọng hát',
        'mix master',
        'mix mastering',
        'sản xuất âm nhạc',
        'hòa âm phối khí',
        'ký sheet nhạc',
        'viết sheet nhạc',
        'phòng thu quận 1',
        'dịch vụ thu âm Hồ Chí Minh',
    ],
    alternates: {
        canonical: '/',
        languages: {
            en: '/en',
            vi: '/vi',
            'x-default': '/en',
        },
    },
    openGraph: {
        type: 'website',
        url: siteConfig.url,
        siteName: siteConfig.name,
        title: siteConfig.name,
        description: siteConfig.description,
        locale: 'vi_VN',
        images: [
            {
                url: '/og-dark-square.png',
                width: 630,
                height: 630,
                alt: `${siteConfig.name} — Phòng thu âm chuyên nghiệp tại TP.HCM`,
            },
        ],
    },
    twitter: {
        card: 'summary',
        title: siteConfig.name,
        description: siteConfig.description,
        images: ['/og-dark-square.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },
    },
    icons: {
        icon: [
            // Light mode favicons
            {
                url: '/icon-light-16x16.png',
                sizes: '16x16',
                type: 'image/png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/icon-light-32x32.png',
                sizes: '32x32',
                type: 'image/png',
                media: '(prefers-color-scheme: light)',
            },
            // Dark mode favicons
            {
                url: '/icon-dark-16x16.png',
                sizes: '16x16',
                type: 'image/png',
                media: '(prefers-color-scheme: dark)',
            },
            {
                url: '/icon-dark-32x32.png',
                sizes: '32x32',
                type: 'image/png',
                media: '(prefers-color-scheme: dark)',
            },
            // PWA / High-res icons
            {
                url: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                url: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        apple: [
            { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
        shortcut: '/icon-light-32x32.png',
    },
};

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params?: Promise<{ lang?: string }>;
}>) {
    const resolvedParams = params ? await params : undefined;
    const lang = resolvedParams?.lang === 'vi' ? 'vi' : 'en';

    return (
        <html
            lang={lang}
            suppressHydrationWarning
            className={`${sansFont.variable} ${monoFont.variable}`}
        >
            <body suppressHydrationWarning className="font-sans antialiased">
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                    <Analytics />
                </ThemeProvider>
            </body>
        </html>
    );
}
