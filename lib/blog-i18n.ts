import type { BlogLocale } from '@/lib/blog';

const blogListCopy = {
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
            'Kiến thức thực chiến về thu âm, vocal production, mix/master workflow từ đội ngũ WAV Vietnam.',
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
