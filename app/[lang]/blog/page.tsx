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

const unsplashFallbackCovers = [
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461783436728-0a9217714694?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
];

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}): Promise<Metadata> {
    const { lang } = await params;
    const locale = toBlogLocale(lang) ?? 'en';
    const i18n = getBlogListCopy(locale);

    return {
        title: i18n.title,
        description: i18n.description,
        alternates: {
            canonical: `/${locale}/blog`,
            languages: {
                en: '/en/blog',
                vi: '/vi/blog',
                'x-default': '/en/blog',
            },
        },
        openGraph: {
            type: 'website',
            title: i18n.title,
            description: i18n.description,
            url: `${siteConfig.url}/${locale}/blog`,
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

export default async function BlogPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const locale = toBlogLocale(lang) ?? 'en';
    setRequestLocale(locale);

    const posts = await getAllPosts(locale);
    const i18n = getBlogListCopy(locale);
    const dateFormatter = new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const listSchema = createBlogListSchema(locale, posts);

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

                    <div className="mt-10 grid gap-5">
                        {posts.map((post, index) => {
                            const hasRemoteCover = post.coverImage?.startsWith('http');
                            const thumbnailSrc = hasRemoteCover
                                ? post.coverImage
                                : unsplashFallbackCovers[index % unsplashFallbackCovers.length];

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
                </div>
            </main>

            <Footer />
        </div>
    );
}
