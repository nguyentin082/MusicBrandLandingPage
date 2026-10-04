import type { ReactNode } from 'react';
import Link from 'next/link';
import { BlogPostHeader } from '@/components/blog/blog-post-header';
import { BlogToc } from '@/components/blog/blog-toc';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import type { BlogLocale, BlogPost } from '@/lib/blog';
import { getBlogPostCopy } from '@/lib/blog-i18n';
import { renderBlogPostContent } from '@/lib/blog-renderer';

/** The full post page, shared by the public post route and the draft preview route. */
export async function BlogPostView({
    post,
    locale,
    jsonLd,
    banner,
}: {
    post: BlogPost;
    locale: BlogLocale;
    jsonLd?: object;
    banner?: ReactNode;
}) {
    const { contentHtml, tocItems } = await renderBlogPostContent(post.content);
    const t = getBlogPostCopy(locale);

    return (
        <div className="min-h-screen bg-off-white dark:bg-dark-umber text-dark-umber dark:text-off-white">
            {jsonLd ? (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            ) : null}

            <Header />

            <main className="pt-28 pb-16 px-6 sm:px-10 lg:px-16">
                {banner}

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
