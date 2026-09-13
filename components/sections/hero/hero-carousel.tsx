'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media';

const HERO_IMAGES = [
    resolveMediaUrl('/image/hero/hero-1.jpg'),
    resolveMediaUrl('/image/hero/hero-2.jpg'),
    resolveMediaUrl('/image/hero/hero-3.jpg'),
    resolveMediaUrl('/image/hero/hero-4.jpg'),
    resolveMediaUrl('/image/hero/hero-5.jpg'),
    resolveMediaUrl('/image/hero/hero-6.jpg'),
    resolveMediaUrl('/image/hero/hero-7.jpg'),
];

const SLIDE_INTERVAL_MS = 5000;
const START_DELAY_MS = 4000;

export function HeroCarousel() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // Set once the user (or the auto-advance timer) has moved off the first
    // slide. Until then the LCP image renders fully opaque with no transition,
    // so Largest Contentful Paint is not delayed by a 700ms fade-in.
    const [hasAdvanced, setHasAdvanced] = useState(false);
    const hasInteractedRef = useRef(false);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        if (prefersReducedMotion) {
            return;
        }

        let interval: number | undefined;

        const advance = () => {
            // Do not burn frames animating a carousel nobody can see.
            if (document.hidden || hasInteractedRef.current) {
                return;
            }
            setHasAdvanced(true);
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
        };

        // Hold the first slide still while the rest of the page loads. A hero
        // that starts mutating immediately keeps the viewport from ever being
        // "visually complete", which is what wrecked Speed Index.
        const startDelay = window.setTimeout(() => {
            interval = window.setInterval(advance, SLIDE_INTERVAL_MS);
        }, START_DELAY_MS);

        return () => {
            window.clearTimeout(startDelay);
            if (interval !== undefined) {
                window.clearInterval(interval);
            }
        };
    }, []);

    const showPreviousImage = () => {
        hasInteractedRef.current = true;
        setHasAdvanced(true);
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? HERO_IMAGES.length - 1 : prevIndex - 1,
        );
    };

    const showNextImage = () => {
        hasInteractedRef.current = true;
        setHasAdvanced(true);
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    };

    const nextIndex = (currentImageIndex + 1) % HERO_IMAGES.length;
    const previousIndex =
        currentImageIndex === 0 ? HERO_IMAGES.length - 1 : currentImageIndex - 1;

    return (
        <div className="relative animate-fade-in mt-8 lg:mt-0">
            <div className="aspect-4/5 rounded-[40px] overflow-hidden border-12 border-soft-brown shadow-2xl relative">
                {HERO_IMAGES.map((src, index) => {
                    // Only the current slide plus its immediate neighbours are
                    // mounted. Rendering all seven made the browser fetch seven
                    // full-size images before the hero was even interactive.
                    const isMounted =
                        index === currentImageIndex ||
                        index === nextIndex ||
                        index === previousIndex;
                    if (!isMounted) {
                        return null;
                    }

                    const isActive = index === currentImageIndex;
                    const isInitialFrame = index === 0 && !hasAdvanced;

                    return (
                        <Image
                            key={src}
                            src={src}
                            fill
                            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 90vw, 40vw"
                            priority={index === 0}
                            fetchPriority={index === 0 ? 'high' : 'auto'}
                            loading={index === 0 ? undefined : 'lazy'}
                            className={`object-cover grayscale ${
                                isInitialFrame
                                    ? 'opacity-90 hover:opacity-100'
                                    : `transition-opacity duration-700 ${
                                          isActive
                                              ? 'opacity-90 hover:opacity-100'
                                              : 'opacity-0 pointer-events-none'
                                      }`
                            }`}
                            alt={`Studio showcase image ${index + 1}`}
                        />
                    );
                })}

                <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-dark-umber/70 text-off-white p-2 hover:bg-dark-umber transition"
                    aria-label="Previous image"
                >
                    <ChevronLeft className="w-5 h-5" aria-hidden="true" focusable="false" />
                </button>

                <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-dark-umber/70 text-off-white p-2 hover:bg-dark-umber transition"
                    aria-label="Next image"
                >
                    <ChevronRight className="w-5 h-5" aria-hidden="true" focusable="false" />
                </button>
            </div>
        </div>
    );
}
