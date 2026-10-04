import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { BlogPostView } from '@/components/blog/blog-post-view';
import { getAllPostParams, getPost, hasPost, toBlogLocale } from '@/lib/blog';
import { createBlogPostSchema } from '@/lib/blog-schema';
import { siteConfig } from '@/lib/site';

// Posts are read from disk at build time, so unknown or draft slugs 404
// instead of being rendered on demand.
export const dynamicParams = false;

export async function generateStaticParams() {
    return getAllPostParams();
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
    const { lang, slug } = await params;
    const locale = toBlogLocale(lang) ?? 'en';
    const post = await getPost(locale, slug);

    if (!post) {
        return {
            title: 'Article Not Found',
        };
    }

    const [hasEn, hasVi] = await Promise.all([hasPost('en', slug), hasPost('vi', slug)]);

    const languageAlternates: Record<string, string> = {
        'x-default': `/en/blog/${slug}`,
    };

    if (hasEn) languageAlternates.en = `/en/blog/${slug}`;
    if (hasVi) languageAlternates.vi = `/vi/blog/${slug}`;

    return {
        title: post.title,
        description: post.description,
        alternates: {
            canonical: `/${locale}/blog/${post.slug}`,
            languages: languageAlternates,
        },
        openGraph: {
            type: 'article',
            title: post.title,
            description: post.description,
            url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            siteName: siteConfig.name,
            locale: locale === 'vi' ? 'vi_VN' : 'en_US',
            images: post.coverImage ? [{ url: post.coverImage, alt: post.title }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            images: post.coverImage ? [post.coverImage] : undefined,
        },
    };
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ lang: string; slug: string }>;
}) {
    const { lang, slug } = await params;
    const locale = toBlogLocale(lang) ?? 'en';
    setRequestLocale(locale);

    const post = await getPost(locale, slug);
    if (!post) notFound();

    const blogSchema = createBlogPostSchema(locale, post);

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${siteConfig.url}/${locale}`,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: `${siteConfig.url}/${locale}/blog`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: `${siteConfig.url}/${locale}/blog/${post.slug}`,
            },
        ],
    };

    const combinedSchema = {
        '@context': 'https://schema.org',
        '@graph': [blogSchema, breadcrumbSchema],
    };

    return <BlogPostView post={post} locale={locale} jsonLd={combinedSchema} />;
}
