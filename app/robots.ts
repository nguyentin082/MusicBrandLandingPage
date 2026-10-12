import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
    // staging.2lab.vn and other preview deployments must never be indexed.
    // VERCEL_ENV is unset outside Vercel, so local dev counts as non-production too.
    if (process.env.VERCEL_ENV !== 'production') {
        return { rules: [{ userAgent: '*', disallow: '/' }] };
    }

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/_next/', '/api/', '/admin'],
            },
        ],
        sitemap: `${siteConfig.url}/sitemap.xml`,
        host: siteConfig.url,
    };
}
