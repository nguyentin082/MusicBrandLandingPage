import type { BlogPost } from '@/lib/blog';

type BlogPostHeaderProps = {
    post: BlogPost;
    labels: {
        published: string;
        updated: string;
        minutes: string;
    };
    locale: 'en' | 'vi';
};

export function BlogPostHeader({ post, labels, locale }: BlogPostHeaderProps) {
    const dateFormatter = new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-soft-brown/80 dark:text-off-white/60">
                <span>
                    {labels.published}: {dateFormatter.format(new Date(post.publishedAt))}
                </span>
                <span>•</span>
                <span>
                    {post.readingTimeMinutes} {labels.minutes}
                </span>
                {post.updatedAt ? (
                    <>
                        <span>•</span>
                        <span>
                            {labels.updated}: {dateFormatter.format(new Date(post.updatedAt))}
                        </span>
                    </>
                ) : null}
            </div>

            <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight">{post.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-soft-brown dark:text-off-white/80">
                {post.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                    <span
                        key={tag}
                        className="rounded-full border border-brick-red/20 bg-brick-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brick-red"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </>
    );
}
