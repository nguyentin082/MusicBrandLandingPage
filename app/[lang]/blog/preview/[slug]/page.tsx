import { timingSafeEqual } from 'node:crypto';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { BlogPostView } from '@/components/blog/blog-post-view';
import { getPostForPreview, toBlogLocale } from '@/lib/blog';

// Draft preview for reviewers: /<lang>/blog/preview/<slug>?token=<PREVIEW_TOKEN>.
// Rendered per request so it also shows drafts. Without a valid token it 404s,
// so it does not reveal which drafts exist. Headers in next.config.mjs add
// noindex, no-store and no-referrer (the token is in the URL).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Preview',
    robots: { index: false, follow: false },
};

const isValidToken = (token: string | string[] | undefined) => {
    const expected = process.env.PREVIEW_TOKEN;
    if (!expected || typeof token !== 'string') return false;
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
};

export default async function BlogPreviewPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string; slug: string }>;
    searchParams: Promise<{ token?: string | string[] }>;
}) {
    const [{ lang, slug }, { token }] = await Promise.all([params, searchParams]);
    const locale = toBlogLocale(lang);
    if (!locale || !isValidToken(token)) notFound();
    setRequestLocale(locale);

    const post = await getPostForPreview(locale, slug);
    if (!post) notFound();

    const banner = (
        <div className="mx-auto mb-8 max-w-6xl rounded-lg border border-brick-red/40 bg-brick-red/10 px-4 py-3 text-sm font-semibold text-brick-red">
            {post.draft
                ? 'BẢN XEM TRƯỚC · Bài nháp, chưa hiện trên website.'
                : 'BẢN XEM TRƯỚC · Bài này đã xuất bản.'}
        </div>
    );

    return <BlogPostView post={post} locale={locale} banner={banner} />;
}
