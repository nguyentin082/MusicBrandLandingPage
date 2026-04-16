import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { siteConfig } from '@/lib/site';
import { getAllPosts, toBlogLocale } from '@/lib/blog';

const copy = {
    en: {
        title: 'Music Production Blog',
        description:
            'Guides and insights about recording, vocal production, and mix/master workflows from WAV Vietnam.',
        badge: 'Studio Journal',
        heading: 'Blog for Indie Artists and Producers',
        back: 'Back to home',
        read: 'Read article',
        minutes: 'min read',
        published: 'Published',
    },
    vi: {
        title: 'Blog Sản Xuất Âm Nhạc',
        description:
            'Kiến thức thực chiến về thu âm, vocal production, mix/master workflow từ đội ngũ WAV Vietnam.',
        badge: 'Studio Journal',
        heading: 'Blog Cho Nghệ Sĩ và Producer',
        back: 'Về trang chủ',
        read: 'Đọc bài viết',
        minutes: 'phút đọc',
        published: 'Ngày đăng',
    },
} as const;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}): Promise<Metadata> {
    const { lang } = await params;
    const locale = toBlogLocale(lang) ?? 'en';
    const i18n = copy[locale];

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

    const [posts] = await Promise.all([getAllPosts(locale)]);
    const i18n = copy[locale];
    const dateFormatter = new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const listSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: posts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
            name: post.title,
        })),
    };

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
                        {posts.map((post) => (
                            <article
                                key={post.slug}
                                className="rounded-3xl border border-dark-umber/10 bg-white/70 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-off-white/10 dark:bg-white/5"
                            >
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
                            </article>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
