'use client';

import type { TocItem } from '@/lib/blog-content';
import { useBlogToc } from '@/hooks/use-blog-toc';

type BlogTocProps = {
    title: string;
    items: TocItem[];
};

export function BlogToc({ title, items }: BlogTocProps) {
    const { activeId, indicatorStyle, itemRefs } = useBlogToc(items);

    if (!items.length) {
        return null;
    }

    return (
        <nav
            aria-label={title}
            className="rounded-2xl bg-white/70 p-3 backdrop-blur-sm dark:bg-dark-umber/55"
        >
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-soft-brown/75 dark:text-off-white/60">
                {title}
            </p>

            <ol className="relative mt-2.5 space-y-1 border-l border-dark-umber/15 pl-3 dark:border-off-white/20">
                {indicatorStyle ? (
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-px w-0.75 rounded-full bg-brick-red transition-all duration-300 ease-out dark:bg-warm-gold"
                        style={{ top: indicatorStyle.top, height: indicatorStyle.height }}
                    />
                ) : null}

                {items.map((item) => {
                    const isActive = activeId === item.id;

                    return (
                        <li key={item.id}>
                            <a
                                href={`#${item.id}`}
                                ref={(element) => {
                                    itemRefs.current[item.id] = element;
                                }}
                                aria-current={isActive ? 'location' : undefined}
                                className={[
                                    'block rounded px-2 py-1 text-[0.8125rem] leading-tight font-medium transition-colors',
                                    item.level === 3 ? 'ml-2.5' : '',
                                    isActive
                                        ? 'bg-brick-red/12 text-brick-red dark:bg-warm-gold/15 dark:text-warm-gold'
                                        : 'text-soft-brown/80 hover:bg-dark-umber/6 hover:text-dark-umber dark:text-off-white/75 dark:hover:bg-off-white/7 dark:hover:text-off-white',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                {item.text}
                            </a>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
