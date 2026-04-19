import type { BlogLocale, BlogPost, BlogPostMeta } from '@/lib/blog';
import { siteConfig } from '@/lib/site';

export function createBlogListSchema(locale: BlogLocale, posts: BlogPostMeta[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: posts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
            name: post.title,
        })),
    };
}

export function createBlogPostSchema(locale: BlogLocale, post: BlogPost) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        mainEntityOfPage: `${siteConfig.url}/${locale}/blog/${post.slug}`,
        publisher: {
            '@type': 'Organization',
            name: siteConfig.name,
            url: siteConfig.url,
        },
        inLanguage: locale,
    };
}
