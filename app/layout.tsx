import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const geist = Geist({
    subsets: ['latin'],
    variable: '--font-geist-sans',
    display: 'swap',
});
const geistMono = Geist_Mono({
    subsets: ['latin'],
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
    title: 'WAV Vietnam | Premium Sound Studio',
    description:
        'Professional recording studio in Vietnam. Expert mix & master services with analog gear. Trusted by 150+ indie artists.',
    generator: 'v0.app',
    icons: {
        icon: [
            {
                url: '/icon-light-32x32.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/icon-dark-32x32.png',
                media: '(prefers-color-scheme: dark)',
            },
            {
                url: '/icon.svg',
                type: 'image/svg+xml',
            },
        ],
        apple: '/apple-icon.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${geist.variable} ${geistMono.variable}`}
        >
            <body className="font-sans antialiased">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    {children}
                    <Analytics />
                </ThemeProvider>
            </body>
        </html>
    );
}
