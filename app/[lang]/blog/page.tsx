import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { getBlogListCopy } from '@/lib/blog-i18n';
import { createBlogListSchema } from '@/lib/blog-schema';
import { siteConfig } from '@/lib/site';
import { getAllPosts, toBlogLocale } from '@/lib/blog';

const POSTS_PER_PAGE = 5;

const unsplashFallbackCovers = [
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461783436728-0a9217714694?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
];

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ page?: string | string[] }>;
}): Promise<Metadata> {
    const { lang } = await params;
    const rawSearchParams = await searchParams;
    const locale = toBlogLocale(lang) ?? 'en';
    const i18n = getBlogListCopy(locale);
    const currentPage = Number(
        Array.isArray(rawSearchParams.page) ? rawSearchParams.page[0] : rawSearchParams.page,
    );
    const page = Number.isFinite(currentPage) && currentPage > 1 ? Math.floor(currentPage) : 1;
    const blogPath = page > 1 ? `/${locale}/blog?page=${page}` : `/${locale}/blog`;

    return {
        title: i18n.title,
        description: i18n.description,
        alternates: {
            canonical: blogPath,
            languages: {
                en: page > 1 ? `/en/blog?page=${page}` : '/en/blog',
                vi: page > 1 ? `/vi/blog?page=${page}` : '/vi/blog',
                'x-default': '/en/blog',
            },
        },
        openGraph: {
            type: 'website',
            title: i18n.title,
            description: i18n.description,
            url: `${siteConfig.url}${blogPath}`,
            siteName: siteConfig.name,
            locale: locale === 'vi' ? 'vi_VN' : 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title: i18n.title,
            description: i18n.description,
        },
    };
}

function createBlogPageHref(locale: string, page: number) {
    return page <= 1 ? `/${locale}/blog` : `/${locale}/blog?page=${page}`;
}

function buildPaginationItems(currentPage: number, totalPages: number) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items: Array<number | 'ellipsis'> = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
        items.push('ellipsis');
    }

    for (let page = start; page <= end; page += 1) {
        items.push(page);
    }

    if (end < totalPages - 1) {
        items.push('ellipsis');
    }

    items.push(totalPages);
    return items;
}

export default async function BlogPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ page?: string | string[] }>;
}) {
    const { lang } = await params;
    const rawSearchParams = await searchParams;
    const locale = toBlogLocale(lang) ?? 'en';
    setRequestLocale(locale);

    const currentPage = Number(
        Array.isArray(rawSearchParams.page) ? rawSearchParams.page[0] : rawSearchParams.page,
    );

    const posts = await getAllPosts(locale);
    const i18n = getBlogListCopy(locale);
    const totalPosts = posts.length;
    const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
    const requestedPage = Number.isFinite(currentPage) ? Math.floor(currentPage) : 1;
    const page = Math.min(Math.max(requestedPage || 1, 1), totalPages);
    const startIndex = (page - 1) * POSTS_PER_PAGE;
    const paginatedPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);
    const rangeStart = totalPosts ? startIndex + 1 : 0;
    const rangeEnd = Math.min(startIndex + POSTS_PER_PAGE, totalPosts);
    const paginationItems = buildPaginationItems(page, totalPages);
    const dateFormatter = new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const listSchema = createBlogListSchema(locale, paginatedPosts);

    return (
        <div className="min-h-screen bg-off-white dark:bg-dark-umber text-dark-umber dark:text-off-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
            />

            <Header />

            <main className="pt-28 pb-16 px-6 sm:px-10 lg:px-16">
                <div className="mx-auto max-w-5xl">
                    <p className="text-xs uppercase tracking-[0.28em] text-brick-red font-bold">
                        {i18n.badge}
                    </p>
                    <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight">
                        {i18n.heading}
                    </h1>

                    <div className="mt-6">
                        <Link
                            href={`/${locale}`}
                            className="inline-flex rounded-full border border-dark-umber/20 px-4 py-2 text-sm font-semibold hover:border-brick-red hover:text-brick-red transition"
                        >
                            {i18n.back}
                        </Link>
                    </div>

                    <div className="mt-10">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="inline-flex w-fit items-center rounded-full bg-dark-umber/6 px-3 py-1 text-sm text-soft-brown dark:bg-off-white/10 dark:text-off-white/80">
                                {i18n.showing} {rangeStart}-{rangeEnd} {i18n.of} {totalPosts}{' '}
                                {i18n.articles}
                            </p>
                            <p className="inline-flex w-fit items-center rounded-full bg-brick-red/12 px-3 py-1 text-sm font-semibold text-brick-red dark:bg-warm-gold/15 dark:text-warm-gold">
                                {i18n.page} {page}/{totalPages}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-5">
                        {paginatedPosts.map((post, index) => {
                            const hasRemoteCover = post.coverImage?.startsWith('http');
                            const thumbnailSrc = hasRemoteCover
                                ? post.coverImage
                                : unsplashFallbackCovers[
                                      (startIndex + index) % unsplashFallbackCovers.length
                                  ];

                            return (
                                <article
                                    key={post.slug}
                                    className="overflow-hidden rounded-3xl border border-dark-umber/10 bg-white/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-off-white/10 dark:bg-white/5"
                                >
                                    <div className="grid md:grid-cols-[15rem_minmax(0,1fr)] md:items-stretch">
                                        <div className="relative aspect-video md:aspect-auto md:h-full">
                                            <Image
                                                src={thumbnailSrc}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 240px"
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="px-6 py-5">
                                            <p className="text-xs uppercase tracking-[0.2em] text-soft-brown/80 dark:text-off-white/60">
                                                {i18n.published}:{' '}
                                                {dateFormatter.format(new Date(post.publishedAt))} ·{' '}
                                                {post.readingTimeMinutes} {i18n.minutes}
                                            </p>

                                            <h2 className="mt-3 text-2xl font-extrabold tracking-tight">
                                                {post.title}
                                            </h2>
                                            <p className="mt-2 text-soft-brown dark:text-off-white/75">
                                                {post.description}
                                            </p>

                                            <Link
                                                href={`/${locale}/blog/${post.slug}`}
                                                className="mt-4 inline-flex text-sm font-bold uppercase tracking-[0.18em] text-brick-red"
                                            >
                                                {i18n.read}
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {totalPages > 1 ? (
                        <nav
                            className="mt-8 flex flex-wrap items-center justify-center gap-2"
                            aria-label="Blog pagination"
                        >
                            <Link
                                href={createBlogPageHref(locale, page - 1)}
                                aria-disabled={page === 1}
                                className={[
                                    'inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition',
                                    page === 1
                                        ? 'pointer-events-none border-dark-umber/10 text-soft-brown/50 dark:border-off-white/10 dark:text-off-white/35'
                                        : 'border-dark-umber/20 hover:border-brick-red hover:text-brick-red',
                                ].join(' ')}
                            >
                                <span aria-hidden="true" className="mr-1">
                                    ←
                                </span>
                                {i18n.previous}
                            </Link>

                            {paginationItems.map((pageItem, index) => {
                                if (pageItem === 'ellipsis') {
                                    return (
                                        <span
                                            key={`ellipsis-${index}`}
                                            aria-hidden="true"
                                            className="inline-flex h-10 min-w-8 items-center justify-center text-soft-brown/70 dark:text-off-white/60"
                                        >
                                            ...
                                        </span>
                                    );
                                }

                                const pageNumber = pageItem;
                                const isCurrent = pageNumber === page;
                                return (
                                    <Link
                                        key={pageNumber}
                                        href={createBlogPageHref(locale, pageNumber)}
                                        aria-current={isCurrent ? 'page' : undefined}
                                        className={[
                                            'inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-bold transition',
                                            isCurrent
                                                ? 'border-brick-red bg-brick-red text-off-white'
                                                : 'border-dark-umber/20 hover:border-brick-red hover:text-brick-red',
                                        ].join(' ')}
                                    >
                                        {pageNumber}
                                    </Link>
                                );
                            })}

                            <Link
                                href={createBlogPageHref(locale, page + 1)}
                                aria-disabled={page === totalPages}
                                className={[
                                    'inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition',
                                    page === totalPages
                                        ? 'pointer-events-none border-dark-umber/10 text-soft-brown/50 dark:border-off-white/10 dark:text-off-white/35'
                                        : 'border-dark-umber/20 hover:border-brick-red hover:text-brick-red',
                                ].join(' ')}
                            >
                                {i18n.next}
                                <span aria-hidden="true" className="ml-1">
                                    →
                                </span>
                            </Link>
                        </nav>
                    ) : null}
                </div>
            </main>

            <Footer />
        </div>
    );
}
