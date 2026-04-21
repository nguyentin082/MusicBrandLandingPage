import type { BlogLocale, BlogPost, BlogPostMeta } from '@/lib/blog';
import { siteConfig } from '@/lib/site';

export function createBlogListSchema(locale: BlogLocale, posts: BlogPostMeta[]) {
    return {
        '@context': 'https://schema.org',
        '@type': ['Blog', 'ItemList'],
        '@id': `${siteConfig.url}/${locale}/blog`,
        name: siteConfig.name,
        publisher: {
            '@type': 'Organization',
            name: siteConfig.name,
            url: siteConfig.url,
            logo: {
                '@type': 'ImageObject',
                url: `${siteConfig.url}/icon.svg`,
            },
        },
        itemListElement: posts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
            name: post.title,
        })),
        blogPost: posts.map((post) => ({
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
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
            logo: {
                '@type': 'ImageObject',
                url: `${siteConfig.url}/icon.svg`,
            },
        },
        author: {
            '@type': 'Organization',
            name: siteConfig.name,
            url: siteConfig.url,
        },
        inLanguage: locale,
    };
}
