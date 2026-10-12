import type { BlogLocale } from '@/lib/blog';

const blogListCopy = {
    en: {
        title: 'Music Production Blog',
        description:
            'Guides and insights about recording, vocal production, and mix/master workflows from 2lab.',
        badge: 'Studio Journal',
        heading: 'Blog for Indie Artists and Producers',
        back: 'Back to home',
        read: 'Read article',
        minutes: 'min read',
        published: 'Published',
        previous: 'Previous',
        next: 'Next',
        page: 'Page',
        showing: 'Showing',
        of: 'of',
        articles: 'articles',
    },
    vi: {
        title: 'Blog Sản Xuất Âm Nhạc',
        description:
            'Kiến thức thực chiến về thu âm, vocal production, mix/master workflow từ đội ngũ 2lab.',
        badge: 'Studio Journal',
        heading: 'Blog Cho Nghệ Sĩ và Producer',
        back: 'Về trang chủ',
        read: 'Đọc bài viết',
        minutes: 'phút đọc',
        published: 'Ngày đăng',
        previous: 'Trước',
        next: 'Sau',
        page: 'Trang',
        showing: 'Hiển thị',
        of: 'trên',
        articles: 'bài viết',
    },
} as const;

const blogPostCopy = {
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

export function getBlogListCopy(locale: BlogLocale) {
    return blogListCopy[locale];
}

export function getBlogPostCopy(locale: BlogLocale) {
    return blogPostCopy[locale];
}

// Draft preview route (/<lang>/blog/preview/<slug>).
const blogPreviewCopy = {
    en: {
        draftTitle: 'Draft · Not published',
        draftBody:
            'This post is not on the website yet. Untick "Draft" in the CMS and save to publish it.',
        publishedTitle: 'Published · Live on the website',
        publishedBody: 'This is a preview of a post that is already on the website.',
        openLive: 'Open live page →',
        checking: 'Checking your access to drafts…',
        deniedTitle: 'Sign in to the CMS to view drafts.',
        deniedBefore: 'Open the',
        deniedLink: 'admin page',
        deniedAfter: ', sign in with GitHub, then reload this page.',
    },
    vi: {
        draftTitle: 'Bản nháp · Chưa xuất bản',
        draftBody: 'Bài chưa hiện trên website. Bỏ tick "Bản nháp" trong CMS rồi Lưu để xuất bản.',
        publishedTitle: 'Đã xuất bản · Đang hiện trên website',
        publishedBody: 'Đây là bản xem trước của bài đã có trên website.',
        openLive: 'Mở trang thật →',
        checking: 'Đang kiểm tra quyền xem bản nháp…',
        deniedTitle: 'Bạn cần đăng nhập CMS để xem bản nháp.',
        deniedBefore: 'Mở',
        deniedLink: 'trang quản trị',
        deniedAfter: ', đăng nhập bằng GitHub, rồi tải lại trang này.',
    },
} as const;

export type BlogPreviewCopy = (typeof blogPreviewCopy)[BlogLocale];

export function getBlogPreviewCopy(locale: BlogLocale): BlogPreviewCopy {
    return blogPreviewCopy[locale];
}

// Front matter stores a language-neutral category key; each locale shows its own label.
const blogCategories: Record<string, Record<BlogLocale, string>> = {
    'music-knowledge': { en: 'Music Knowledge', vi: 'Kiến thức âm nhạc' },
};

export function getCategoryLabel(category: string | undefined, locale: BlogLocale) {
    if (!category) return undefined;
    return blogCategories[category]?.[locale] ?? category;
}
