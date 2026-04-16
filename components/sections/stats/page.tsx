'use client';

import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { useTranslations } from 'next-intl';

const CIRCLE_RADIUS = 250;
const SPRING_CONFIG = { stiffness: 420, damping: 30, mass: 0.4 };
const STATS = [
    { key: 'projects' },
    { key: 'artists' },
    { key: 'streams' },
    { key: 'experience' },
] as const;

const STATS_ANIMATION_CSS = `
    @keyframes statsSlideUp {
        0% {
            opacity: 0;
            transform: translateY(20px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes statsPulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    .stats-item {
        animation: statsSlideUp 0.6s ease-out forwards;
        opacity: 0;
    }
    .stats-item:nth-child(1) {
        animation-delay: 0.1s;
    }
    .stats-item:nth-child(2) {
        animation-delay: 0.2s;
    }
    .stats-item:nth-child(3) {
        animation-delay: 0.3s;
    }
    .stats-item:nth-child(4) {
        animation-delay: 0.4s;
    }
    .stats-number {
        animation: statsPulse 2s ease-in-out infinite;
    }
`;

type StatsKey = (typeof STATS)[number]['key'];

export function StatsSection() {
    const t = useTranslations('stats');
    const mouseX = useMotionValue(-9999);
    const mouseY = useMotionValue(-9999);
    const overlayOpacity = useMotionValue(0);

    const smoothMouseX = useSpring(mouseX, SPRING_CONFIG);
    const smoothMouseY = useSpring(mouseY, SPRING_CONFIG);
    const smoothOpacity = useSpring(overlayOpacity, SPRING_CONFIG);
    const revealClipPath = useMotionTemplate`circle(${CIRCLE_RADIUS}px at ${smoothMouseX}px ${smoothMouseY}px)`;

    const renderStatItems = (numberClassName: string, labelClassName: string, keyPrefix = '') => {
        return STATS.map(({ key }) => {
            const statKey = key as StatsKey;
            return (
                <div key={`${keyPrefix}${statKey}`} className="stats-item">
                    <div
                        className={`stats-number text-7xl md:text-8xl font-black mb-4 italic ${numberClassName}`}
                    >
                        {t(`${statKey}.number`)}
                    </div>
                    <p
                        className={`text-[10px] font-bold uppercase tracking-widest italic ${labelClassName}`}
                    >
                        {t(`${statKey}.label`)}
                    </p>
                </div>
            );
        });
    };

    return (
        <section
            className="relative overflow-hidden py-20 bg-warm-gold dark:bg-warm-gold select-none"
            onMouseEnter={() => overlayOpacity.set(1)}
            onMouseLeave={() => overlayOpacity.set(0)}
            onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                mouseX.set(event.clientX - rect.left);
                mouseY.set(event.clientY - rect.top);
            }}
        >
            <style>{STATS_ANIMATION_CSS}</style>
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
                    {renderStatItems('text-dark-umber', 'text-dark-umber/70')}
                </div>
            </div>
            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
                style={{
                    opacity: smoothOpacity,
                    clipPath: revealClipPath,
                }}
            >
                <div className="h-full w-full bg-dark-umber">
                    <div className="max-w-7xl mx-auto px-6 py-20">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
                            {renderStatItems('text-warm-gold', 'text-warm-gold/80', 'inverted-')}
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
