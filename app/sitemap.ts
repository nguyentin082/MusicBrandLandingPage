import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

const locales = ['en', 'vi'];

export default function sitemap(): MetadataRoute.Sitemap {
    return locales.map((lang) => ({
        url: `${siteConfig.url}/${lang}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
    }));
}
