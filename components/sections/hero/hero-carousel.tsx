'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1483000805330-4eaf0a0d82da?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1632582204758-5ac65783517a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1636127740588-4751dc6035ed?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1634041322763-61fc86332d5e?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1698825598805-c9e788e6cff3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1714893656836-a7eb3b3657f6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1693454992816-f2bcbcd1cefb?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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
            <div className="aspect-[4/5] rounded-[40px] overflow-hidden border-[12px] border-soft-brown shadow-2xl relative">
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