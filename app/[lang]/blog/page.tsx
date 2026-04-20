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
        <div className="min-h-screen bg-off-white dark:bg-dark-umber text-dark-umber dark:text-off-white selection:bg-brick-red/30 dark:selection:bg-warm-gold/30">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
            />

            <Header />

            <main className="pt-32 pb-24 px-6 sm:px-10 lg:px-16">
                <div className="mx-auto max-w-5xl">
                    {/* Hero Section */}
                    <div className="group relative overflow-hidden rounded-[3rem] bg-dark-umber px-8 py-16 sm:px-16 sm:py-24 text-center mb-16 shadow-2xl dark:bg-[#110e0c]">
                        {/* Background Image / Cover */}
                        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                            <Image
                                src={`${process.env.NEXT_PUBLIC_ASSET_BASE_URL || ''}/image/blog/blog-cover.jpg`}
                                alt="Blog Cover"
                                fill
                                priority
                                className="object-cover opacity-60 dark:opacity-50 transition-transform duration-1000 ease-out group-hover:scale-105"
                                sizes="(max-width: 1024px) 100vw, 1024px"
                            />
                            {/* Overlay variant to ensure text readability */}
                            <div className="absolute inset-0 bg-dark-umber/60 dark:bg-[#110e0c]/70 mix-blend-multiply" />
                            <div className="absolute inset-0 bg-gradient-to-t from-dark-umber via-dark-umber/40 to-transparent dark:from-[#110e0c] dark:via-[#110e0c]/40" />
                        </div>
                        
                        <div className="absolute inset-0 opacity-50 dark:opacity-60 mix-blend-color-dodge pointer-events-none z-0">
                            <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brick-red/70 via-transparent to-transparent rotate-12 blur-3xl transition-opacity duration-700 ease-in-out group-hover:opacity-80"></div>
                            <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[100%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-warm-gold/60 via-transparent to-transparent -rotate-12 blur-3xl transition-opacity duration-700 ease-in-out group-hover:opacity-80"></div>
                        </div>
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-warm-gold font-bold backdrop-blur-md mb-6 shadow-sm">
                                {i18n.badge}
                            </span>
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-off-white drop-shadow-sm max-w-3xl">
                                {i18n.heading}
                            </h1>
                            
                            <Link
                                href={`/${locale}`}
                                className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-off-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5"
                            >
                                <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                                {i18n.back}
                            </Link>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
                        <p className="font-medium text-soft-brown/70 dark:text-off-white/60">
                            {i18n.showing} <span className="text-dark-umber dark:text-off-white font-bold">{rangeStart}-{rangeEnd}</span> {i18n.of} <span className="text-dark-umber dark:text-off-white font-bold">{totalPosts}</span> {i18n.articles}
                        </p>
                        <div className="h-px flex-1 bg-dark-umber/10 dark:bg-off-white/10 hidden sm:block mx-8"></div>
                        <p className="inline-flex items-center rounded-full bg-brick-red/10 px-4 py-1.5 text-sm font-semibold text-brick-red dark:bg-warm-gold/15 dark:text-warm-gold ring-1 ring-brick-red/20 dark:ring-warm-gold/20">
                            {i18n.page} {page}/{totalPages}
                        </p>
                    </div>

                    {/* Posts Grid */}
                    <div className="grid gap-8">
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
                                    className="group relative overflow-hidden rounded-[2.5rem] border border-dark-umber/10 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(166,61,45,0.15)] dark:border-off-white/10 dark:bg-white/5 dark:hover:shadow-[0_20px_40px_-15px_rgba(212,163,83,0.15)]"
                                >
                                    <Link href={`/${locale}/blog/${post.slug}`} className="absolute inset-0 z-20">
                                        <span className="sr-only">{i18n.read} {post.title}</span>
                                    </Link>
                                    <div className="grid md:grid-cols-[22rem_minmax(0,1fr)] items-stretch h-full">
                                        <div className="relative aspect-video md:aspect-auto overflow-hidden bg-dark-umber/5">
                                            <Image
                                                src={thumbnailSrc}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 350px"
                                                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-dark-umber/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                        </div>

                                        <div className="flex flex-col justify-center px-6 py-8 md:p-10 relative z-10 bg-white/50 backdrop-blur-sm dark:bg-transparent">
                                            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-brick-red dark:text-warm-gold mb-4">
                                                <span>{dateFormatter.format(new Date(post.publishedAt))}</span>
                                                <span className="w-1 h-1 rounded-full bg-soft-brown/40 dark:bg-off-white/40" />
                                                <span>{post.readingTimeMinutes} {i18n.minutes}</span>
                                            </div>

                                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark-umber dark:text-off-white transition-colors duration-300 group-hover:text-brick-red dark:group-hover:text-warm-gold">
                                                {post.title}
                                            </h2>
                                            <p className="mt-4 text-soft-brown dark:text-off-white/70 line-clamp-3 leading-relaxed text-base sm:text-lg">
                                                {post.description}
                                            </p>

                                            <div className="mt-8 flex items-center font-bold uppercase tracking-[0.15em] text-sm text-dark-umber dark:text-off-white transition-colors duration-300 group-hover:text-brick-red dark:group-hover:text-warm-gold">
                                                {i18n.read}
                                                <svg className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 ? (
                        <nav
                            className="mt-16 flex flex-wrap items-center justify-center gap-2"
                            aria-label="Blog pagination"
                        >
                            <Link
                                href={createBlogPageHref(locale, page - 1)}
                                aria-disabled={page === 1}
                                className={[
                                    'inline-flex h-12 items-center justify-center rounded-full border px-5 text-sm font-bold transition-all duration-300',
                                    page === 1
                                        ? 'pointer-events-none border-dark-umber/10 bg-transparent text-soft-brown/40 dark:border-off-white/10 dark:text-off-white/30'
                                        : 'border-dark-umber/20 bg-white/50 text-dark-umber hover:border-brick-red hover:bg-brick-red hover:text-off-white hover:shadow-lg hover:-translate-y-0.5 dark:border-off-white/20 dark:bg-dark-umber/50 dark:text-off-white dark:hover:border-warm-gold dark:hover:bg-warm-gold',
                                ].join(' ')}
                            >
                                <svg className="mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                {i18n.previous}
                            </Link>

                            <div className="hidden sm:flex items-center gap-2 mx-2">
                                {paginationItems.map((pageItem, index) => {
                                    if (pageItem === 'ellipsis') {
                                        return (
                                            <span
                                                key={`ellipsis-${index}`}
                                                aria-hidden="true"
                                                className="inline-flex h-12 min-w-8 items-center justify-center text-soft-brown/50 dark:text-off-white/40 tracking-widest"
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
                                                'inline-flex h-12 min-w-12 items-center justify-center rounded-full border text-sm font-bold transition-all duration-300',
                                                isCurrent
                                                    ? 'border-brick-red bg-brick-red text-off-white shadow-md dark:border-warm-gold dark:bg-warm-gold dark:text-dark-umber'
                                                    : 'border-dark-umber/10 bg-white/50 text-soft-brown hover:border-brick-red hover:text-brick-red hover:-translate-y-0.5 dark:border-off-white/10 dark:bg-dark-umber/50 dark:text-off-white/80 dark:hover:border-warm-gold dark:hover:text-warm-gold',
                                            ].join(' ')}
                                        >
                                            {pageNumber}
                                        </Link>
                                    );
                                })}
                            </div>

                            <Link
                                href={createBlogPageHref(locale, page + 1)}
                                aria-disabled={page === totalPages}
                                className={[
                                    'inline-flex h-12 items-center justify-center rounded-full border px-5 text-sm font-bold transition-all duration-300',
                                    page === totalPages
                                        ? 'pointer-events-none border-dark-umber/10 bg-transparent text-soft-brown/40 dark:border-off-white/10 dark:text-off-white/30'
                                        : 'border-dark-umber/20 bg-white/50 text-dark-umber hover:border-brick-red hover:bg-brick-red hover:text-off-white hover:shadow-lg hover:-translate-y-0.5 dark:border-off-white/20 dark:bg-dark-umber/50 dark:text-off-white dark:hover:border-warm-gold dark:hover:bg-warm-gold',
                                ].join(' ')}
                            >
                                {i18n.next}
                                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </nav>
                    ) : null}
                </div>
            </main>

            <Footer />
        </div>
    );
}

