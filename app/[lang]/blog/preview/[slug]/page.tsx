import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { BlogPostView } from '@/components/blog/blog-post-view';
import { PreviewSignIn } from '@/components/blog/preview-sign-in';
import { getPostForPreview, toBlogLocale } from '@/lib/blog';
import { getBlogPreviewCopy } from '@/lib/blog-i18n';
import { isValidPreviewSession, isValidPreviewToken, PREVIEW_COOKIE } from '@/lib/cms-auth';

// Draft preview for reviewers: /<lang>/blog/preview/<slug>. Rendered per request
// so it also shows drafts. Access, either:
// - `?token=<PREVIEW_TOKEN>`, for links sent outside the CMS (Telegram), or
// - the preview cookie from /api/cms/preview-session. CMS editors get it
//   automatically: "View on Live Site" in the CMS opens this route, and
//   PreviewSignIn trades their CMS sign-in for the cookie.
// Nothing about the post is rendered before access is checked, so the page does
// not reveal which drafts exist. Headers in next.config.mjs add noindex,
// no-store and no-referrer.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Preview',
    robots: { index: false, follow: false },
};

export default async function BlogPreviewPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string; slug: string }>;
    searchParams: Promise<{ token?: string | string[] }>;
}) {
    const [{ lang, slug }, { token }, cookieStore] = await Promise.all([
        params,
        searchParams,
        cookies(),
    ]);
    const locale = toBlogLocale(lang);
    if (!locale) notFound();

    const allowed =
        isValidPreviewToken(token) || isValidPreviewSession(cookieStore.get(PREVIEW_COOKIE)?.value);
    const t = getBlogPreviewCopy(locale);
    if (!allowed) return <PreviewSignIn copy={t} />;

    setRequestLocale(locale);
    const post = await getPostForPreview(locale, slug);
    if (!post) notFound();

    // Draft and published must be told apart at a glance: amber vs green.
    const banner = post.draft ? (
        <div className="mx-auto mb-8 flex max-w-6xl items-center gap-3 rounded-lg border-2 border-amber-500 bg-amber-100 px-4 py-3 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <span aria-hidden className="text-2xl">
                📝
            </span>
            <div>
                <p className="font-bold uppercase tracking-wide">{t.draftTitle}</p>
                <p className="text-sm">{t.draftBody}</p>
            </div>
        </div>
    ) : (
        <div className="mx-auto mb-8 flex max-w-6xl flex-wrap items-center gap-3 rounded-lg border-2 border-emerald-600 bg-emerald-100 px-4 py-3 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            <span aria-hidden className="text-2xl">
                ✅
            </span>
            <div className="flex-1">
                <p className="font-bold uppercase tracking-wide">{t.publishedTitle}</p>
                <p className="text-sm">{t.publishedBody}</p>
            </div>
            <a
                href={`/${locale}/blog/${post.slug}`}
                className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
                {t.openLive}
            </a>
        </div>
    );

    return <BlogPostView post={post} locale={locale} banner={banner} />;
}
