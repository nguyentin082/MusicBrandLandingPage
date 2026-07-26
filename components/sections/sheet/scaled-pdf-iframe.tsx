'use client';

import { useRef, useEffect, useState } from 'react';

// PDF native width (standard letter/A4 PDF rendered at 72dpi = 612px)
const PDF_NATIVE_WIDTH = 612;
// A4 aspect ratio (√2 ≈ 1.414) → ~866px height at native width
const PDF_NATIVE_HEIGHT = Math.round(PDF_NATIVE_WIDTH * 1.414);

interface ScaledPdfIframeProps {
    src: string;
    title: string;
}

/**
 * Responsive scaled iframe wrapper for PDF.
 *
 * Strategy:
 *  1. Measure the outer container width via ResizeObserver.
 *  2. Compute scale = containerWidth / PDF_NATIVE_WIDTH.
 *  3. Render the iframe at its natural width (612px) then CSS-scale it down.
 *  4. Shrink the outer container height to match the scaled iframe height
 *     so there is no overflow or white gap.
 *
 * This avoids any horizontal scroll because the iframe never exceeds
 * the container width regardless of screen size.
 */
export function ScaledPdfIframe({ src, title }: ScaledPdfIframeProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const update = () => {
            const containerW = el.offsetWidth;
            if (containerW > 0) {
                setScale(Math.min(1, containerW / PDF_NATIVE_WIDTH));
            }
        };

        update();

        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const scaledH = Math.round(PDF_NATIVE_HEIGHT * scale);

    return (
        // Outer container: clamps to the scaled height, clips overflow
        <div
            ref={containerRef}
            className="w-full overflow-hidden rounded-2xl shadow-2xl border border-dark-umber/10 dark:border-off-white/10 bg-white dark:bg-dark-umber/50"
            style={{ height: scaledH }}
        >
            {/* Inner wrapper: natural PDF size, scaled from top-left origin */}
            <div
                style={{
                    width: PDF_NATIVE_WIDTH,
                    height: PDF_NATIVE_HEIGHT,
                    transformOrigin: 'top left',
                    transform: `scale(${scale})`,
                }}
            >
                <iframe
                    key={src}
                    src={`${src}#toolbar=0&view=FitH&zoom=page-width`}
                    width={PDF_NATIVE_WIDTH}
                    height={PDF_NATIVE_HEIGHT}
                    className="border-0"
                    title={title}
                />
            </div>
        </div>
    );
}
