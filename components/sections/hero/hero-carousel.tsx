'use client';

import { useEffect, useState } from 'react';
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

export function HeroCarousel() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const showPreviousImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? HERO_IMAGES.length - 1 : prevIndex - 1,
        );
    };

    const showNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    };

    return (
        <div className="relative animate-fade-in mt-8 lg:mt-0">
            <div className="aspect-4/5 rounded-[40px] overflow-hidden border-12 border-soft-brown shadow-2xl relative">
                {HERO_IMAGES.map((src, index) => (
                    <Image
                        key={src}
                        src={src}
                        fill
                        sizes="(max-width: 1024px) 90vw, 40vw"
                        priority={index === 0}
                        className={`object-cover grayscale transition-opacity duration-700 ${
                            index === currentImageIndex
                                ? 'opacity-90 hover:opacity-100'
                                : 'opacity-0 pointer-events-none'
                        }`}
                        alt={`Studio showcase image ${index + 1}`}
                    />
                ))}

                <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-dark-umber/70 text-off-white p-2 hover:bg-dark-umber transition"
                    aria-label="Previous image"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-dark-umber/70 text-off-white p-2 hover:bg-dark-umber transition"
                    aria-label="Next image"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
