import type { BlogLocale, BlogPost, BlogPostMeta } from '@/lib/blog';
import { siteConfig } from '@/lib/site';

export function createBlogListSchema(locale: BlogLocale, posts: BlogPostMeta[]) {
    return {
        '@context': 'https://schema.org',
        '@type': ['Blog', 'ItemList'],
        '@id': `${siteConfig.url}/${locale}/blog`,
        name: `${siteConfig.name} Blog`,
        publisher: {
            '@type': 'Organization',
            name: siteConfig.name,
            url: siteConfig.url,
            logo: {
                '@type': 'ImageObject',
                url: `${siteConfig.url}/icon-512.png`,
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
            wordCount: post.wordCount,
            ...(post.coverImage && {
                image: {
                    '@type': 'ImageObject',
                    url: post.coverImage,
                },
            }),
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
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${siteConfig.url}/${locale}/blog/${post.slug}`,
        },
        ...(post.coverImage && {
            image: {
                '@type': 'ImageObject',
                url: post.coverImage,
            },
        }),
        publisher: {
            '@type': 'Organization',
            name: siteConfig.name,
            url: siteConfig.url,
            logo: {
                '@type': 'ImageObject',
                url: `${siteConfig.url}/icon-512.png`,
            },
        },
        author: {
            '@type': 'Organization',
            name: siteConfig.name,
            url: siteConfig.url,
        },
        inLanguage: locale === 'vi' ? 'vi-VN' : 'en-US',
        ...(post.tags?.length && { keywords: post.tags.join(', ') }),
        ...(post.category && { articleSection: post.category }),
        wordCount: post.wordCount,
        articleBody: post.content.replace(/<[^>]*>?/gm, '').substring(0, 10000), // Strip HTML and limit length just in case
        timeRequired: `PT${post.readingTimeMinutes}M`,
    };
}
