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
    keywords: [
        'recording studio',
        'mixing',
        'mastering',
        'Vietnam',
        'Ho Chi Minh City',
        'music production',
        'sound studio',
    ],
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        url: siteConfig.url,
        siteName: siteConfig.name,
        title: siteConfig.name,
        description: siteConfig.description,
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.name,
        description: siteConfig.description,
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
    generator: 'v0.app',
    icons: {
        icon: [
            {
                url: '/icon-light.svg',
                media: '(prefers-color-scheme: light)',
                type: 'image/svg+xml',
            },
            {
                url: '/icon.svg',
                media: '(prefers-color-scheme: dark)',
                type: 'image/svg+xml',
            },
        ],
        apple: '/apple-icon.png',
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
