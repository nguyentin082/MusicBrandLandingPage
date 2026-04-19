'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { TocItem } from '@/lib/blog-content';

type IndicatorStyle = {
    top: number;
    height: number;
};

export function useBlogToc(items: TocItem[]) {
    const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');
    const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle | null>(null);
    const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

    const headingIds = useMemo(() => items.map((item) => item.id), [items]);

    useEffect(() => {
        if (!headingIds.length) {
            return;
        }

        const findActiveByScroll = () => {
            const offsetTop = 140;
            const sections = headingIds
                .map((id) => document.getElementById(id))
                .filter((section): section is HTMLElement => Boolean(section));

            let current = sections[0]?.id ?? '';

            for (const section of sections) {
                if (section.getBoundingClientRect().top <= offsetTop) {
                    current = section.id;
                }
            }

            if (current) {
                setActiveId(current);
            }
        };

        const visible = new Map<string, number>();
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const id = (entry.target as HTMLElement).id;
                    if (!id) continue;

                    if (entry.isIntersecting) {
                        visible.set(id, entry.boundingClientRect.top);
                    } else {
                        visible.delete(id);
                    }
                }

                if (visible.size) {
                    const [nextId] = [...visible.entries()].sort(
                        (a, b) => Math.abs(a[1]) - Math.abs(b[1]),
                    )[0];
                    setActiveId(nextId);
                    return;
                }

                findActiveByScroll();
            },
            {
                rootMargin: '-128px 0px -55% 0px',
                threshold: [0, 1],
            },
        );

        for (const id of headingIds) {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        }

        findActiveByScroll();

        return () => {
            observer.disconnect();
        };
    }, [headingIds]);

    useEffect(() => {
        const updateIndicatorPosition = () => {
            const activeElement = itemRefs.current[activeId];
            if (!activeElement) {
                return;
            }

            setIndicatorStyle({
                top: activeElement.offsetTop,
                height: activeElement.offsetHeight,
            });
        };

        updateIndicatorPosition();

        window.addEventListener('resize', updateIndicatorPosition, { passive: true });
        return () => {
            window.removeEventListener('resize', updateIndicatorPosition);
        };
    }, [activeId, headingIds]);

    return {
        activeId,
        indicatorStyle,
        itemRefs,
    };
}
