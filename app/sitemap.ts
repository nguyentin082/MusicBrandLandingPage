import type { MetadataRoute } from 'next';
import { getAllPosts, BLOG_LOCALES } from '@/lib/blog';
import { siteConfig } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const homeAndIndexEntries = BLOG_LOCALES.flatMap((lang) => [
        {
            url: `${siteConfig.url}/${lang}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 1,
        },
        {
            url: `${siteConfig.url}/${lang}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
    ]);

    const postEntries = await Promise.all(
        BLOG_LOCALES.map(async (lang) => {
            const posts = await getAllPosts(lang);

            return posts.map((post) => ({
                url: `${siteConfig.url}/${lang}/blog/${post.slug}`,
                lastModified: new Date(post.updatedAt ?? post.publishedAt),
                changeFrequency: 'monthly' as const,
                priority: 0.7,
            }));
        }),
    );

    return [...homeAndIndexEntries, ...postEntries.flat()];
}
