import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { BlogToc } from '@/components/blog/blog-toc';
import { getAllPostParams, getPost, hasPost, toBlogLocale } from '@/lib/blog';
import { rehypeCollectHeadings, rehypeOptimizeImages, type TocItem } from '@/lib/blog-content';
import { siteConfig } from '@/lib/site';

const localeText = {
    en: {
        back: 'Back to blog',
        published: 'Published',
        updated: 'Updated',
        minutes: 'min read',
        toc: 'On this page',
    },
    vi: {
        back: 'Quay lại blog',
        published: 'Ngày đăng',
        updated: 'Cập nhật',
        minutes: 'phút đọc',
        toc: 'Mục lục',
    },
} as const;

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

    const tocItems: TocItem[] = [];

    const renderedPost = await unified()
        .use(remarkParse)
        .use(remarkMdx)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeSlug)
        .use(rehypeCollectHeadings(tocItems))
        .use(rehypeAutolinkHeadings, { behavior: 'append' })
        .use(rehypeOptimizeImages)
        .use(rehypeStringify)
        .process(post.content);

    const contentHtml = String(renderedPost);

    const t = localeText[locale];
    const dateFormatter = new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const blogSchema = {
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

    return (
        <div className="min-h-screen bg-off-white dark:bg-dark-umber text-dark-umber dark:text-off-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
            />

            <Header />

            <main className="pt-28 pb-16 px-6 sm:px-10 lg:px-16">
                <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start">
                    <article className="min-w-0 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-soft-brown/80 dark:text-off-white/60">
                            <span>
                                {t.published}: {dateFormatter.format(new Date(post.publishedAt))}
                            </span>
                            <span>•</span>
                            <span>
                                {post.readingTimeMinutes} {t.minutes}
                            </span>
                            {post.updatedAt ? (
                                <>
                                    <span>•</span>
                                    <span>
                                        {t.updated}:{' '}
                                        {dateFormatter.format(new Date(post.updatedAt))}
                                    </span>
                                </>
                            ) : null}
                        </div>

                        <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight">
                            {post.title}
                        </h1>
                        <p className="mt-4 text-lg leading-relaxed text-soft-brown dark:text-off-white/80">
                            {post.description}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full border border-brick-red/20 bg-brick-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brick-red"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div
                            className="mt-10 mdx-content mdx-html"
                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                        />

                        <div className="mt-10">
                            <Link
                                href={`/${locale}/blog`}
                                className="inline-flex rounded-full border border-dark-umber/20 px-4 py-2 text-sm font-semibold hover:border-brick-red hover:text-brick-red transition"
                            >
                                {t.back}
                            </Link>
                        </div>
                    </article>

                    {tocItems.length ? (
                        <aside className="lg:sticky lg:top-28 lg:self-start">
                            <BlogToc title={t.toc} items={tocItems} />
                        </aside>
                    ) : null}
                </div>
            </main>

            <Footer />
        </div>
    );
}
