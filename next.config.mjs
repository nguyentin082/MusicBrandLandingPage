import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
const assetBaseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL;

const assetRemotePattern = (() => {
    if (!assetBaseUrl) {
        return null;
    }

    try {
        const parsed = new URL(assetBaseUrl);
        const basePath = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');

        return {
            protocol: parsed.protocol.replace(':', ''),
            hostname: parsed.hostname,
            port: parsed.port,
            pathname: `${basePath}/**`,
        };
    } catch {
        return null;
    }
})();

/** @type {import('next').NextConfig} */
const baseConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    compress: true,
    // Enable React Server Components streaming
    reactStrictMode: true,
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'dummyimage.com',
            },
            ...(assetRemotePattern ? [assetRemotePattern] : []),
        ],
    },
    experimental: {
        // Tree-shake unused icons/components
        optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-accordion'],
        // Enable PPR (Partial Pre-rendering) for static shell + dynamic streams
        ppr: false, // set to true when upgrading to Next.js 15 stable PPR
    },
    // HTTP headers for static assets caching
    async headers() {
        return [
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/(.*)\\.(ico|png|svg|jpg|jpeg|webp|avif|woff|woff2)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=604800',
                    },
                ],
            },
        ];
    },
};

export default withNextIntl(baseConfig);
