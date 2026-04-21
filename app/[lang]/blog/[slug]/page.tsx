import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { BlogPostHeader } from '@/components/blog/blog-post-header';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { BlogToc } from '@/components/blog/blog-toc';
import { getAllPostParams, getPost, hasPost, toBlogLocale } from '@/lib/blog';
import { getBlogPostCopy } from '@/lib/blog-i18n';
import { renderBlogPostContent } from '@/lib/blog-renderer';
import { createBlogPostSchema } from '@/lib/blog-schema';
import { siteConfig } from '@/lib/site';

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

    const { contentHtml, tocItems } = await renderBlogPostContent(post.content);
    const t = getBlogPostCopy(locale);
    const blogSchema = createBlogPostSchema(locale, post);

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
                        <BlogPostHeader
                            post={post}
                            labels={{
                                published: t.published,
                                updated: t.updated,
                                minutes: t.minutes,
                            }}
                            locale={locale}
                        />

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
