'use client';

import { useEffect, useState } from 'react';
import {
    ChevronUp,
    Facebook,
    Headphones,
    Instagram,
    MessageSquareText,
    PhoneCall,
    Send,
    X,
} from 'lucide-react';
import { SiZalo, SiTiktok } from 'react-icons/si';
import { contactInfo } from '@/lib/contact';

type ContactFabLabels = {
    eyebrow: string;
    trigger: string;
    title: string;
    description: string;
    call: string;
    sms: string;
    zalo: string;
    facebook: string;
    instagram: string;
    tiktok: string;
    telegram: string;
    scrollTop: string;
};

const contactActions = [
    {
        key: 'call',
        href: contactInfo.links.call,
        labelKey: 'call',
        icon: PhoneCall,
        external: false,
    },
    {
        key: 'sms',
        href: contactInfo.links.sms,
        labelKey: 'sms',
        icon: MessageSquareText,
        external: false,
    },
    {
        key: 'zalo',
        href: contactInfo.links.zalo,
        labelKey: 'zalo',
        icon: SiZalo,
        external: true,
    },
    {
        key: 'facebook',
        href: contactInfo.links.facebook,
        labelKey: 'facebook',
        icon: Facebook,
        external: true,
    },
    {
        key: 'instagram',
        href: contactInfo.links.instagram,
        labelKey: 'instagram',
        icon: Instagram,
        external: true,
    },
    {
        key: 'tiktok',
        href: contactInfo.links.tiktok,
        labelKey: 'tiktok',
        icon: SiTiktok,
        external: true,
    },
    {
        key: 'telegram',
        href: contactInfo.links.telegram,
        labelKey: 'telegram',
        icon: Send,
        external: true,
    },
] as const;

export function StickyContactFab({ labels }: { labels: ContactFabLabels }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isScrollTopVisible, setIsScrollTopVisible] = useState(false);
    const mobileMenuItems = contactActions.map((action, index) => ({
        ...action,
        delay: index * 45,
    }));

    useEffect(() => {
        const updateScrollTopVisibility = () => {
            setIsScrollTopVisible(window.scrollY > 560);
        };

        updateScrollTopVisibility();
        window.addEventListener('scroll', updateScrollTopVisibility, { passive: true });

        return () => window.removeEventListener('scroll', updateScrollTopVisibility);
    }, []);

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsMobileOpen(false);
    };

    return (
        <>
            <style suppressHydrationWarning>{`
                @keyframes fab-soft-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(212, 163, 83, 0.7); }
                    70% { box-shadow: 0 0 0 25px rgba(212, 163, 83, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(212, 163, 83, 0); }
                }
                .animate-fab-pulse {
                    animation: fab-soft-pulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
                }
            `}</style>
            
            <div 
                className={`fixed inset-0 z-40 bg-dark-umber/60 backdrop-blur-sm transition-opacity duration-300 sm:hidden ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileOpen(false)}
            />

            <div className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 pointer-events-none sm:hidden">
                <div
                    id="sticky-contact-mobile-menu"
                    className={`absolute bottom-[4.5rem] inset-x-0 mx-auto w-full max-w-sm origin-bottom overflow-hidden rounded-3xl border border-white/35 bg-white/95 p-3 shadow-[0_24px_60px_rgba(26,22,20,0.25)] backdrop-blur-3xl transform-gpu will-change-transform transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:border-white/15 dark:bg-dark-umber/95 dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] ${isMobileOpen ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto' : 'pointer-events-none translate-y-12 scale-90 opacity-0'}`}
                >
                    <div className="flex flex-col gap-3">
                        <div className="px-4 py-3 border-b border-dark-umber/10 dark:border-white/10 text-center">
                            <p className="text-[10px] font-bold text-warm-gold uppercase tracking-widest mb-1">{labels.eyebrow}</p>
                            <p className="text-base font-bold text-dark-umber dark:text-off-white leading-tight">{labels.title}</p>
                            <p className="text-[11px] text-dark-umber/60 dark:text-off-white/60 mt-1.5 leading-relaxed">{labels.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {contactActions.map(
                                ({ key, href, labelKey, icon: Icon, external }) => (
                                    <a
                                        key={key}
                                        href={href}
                                        target={external ? '_blank' : undefined}
                                        rel={external ? 'noreferrer' : undefined}
                                        aria-label={labels[labelKey]}
                                        title={labels[labelKey]}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`group relative flex flex-col items-center justify-center gap-2.5 rounded-2xl border p-4 shadow-sm transition-[transform,background-color,color] duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80 touch-manipulation [-webkit-tap-highlight-color:transparent] ${
                                            key === 'call'
                                                ? 'border-warm-gold/40 bg-warm-gold/15 text-dark-umber dark:border-warm-gold/30 dark:bg-warm-gold/20 dark:text-warm-gold font-semibold'
                                                : 'border-dark-umber/10 bg-off-white text-dark-umber dark:border-off-white/10 dark:bg-off-white/10 dark:text-off-white'
                                        }`}
                                    >
                                        <Icon
                                            className="size-6 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110"
                                            aria-hidden="true"
                                            focusable="false"
                                        />
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-center">
                                            {labels[labelKey]}
                                        </span>
                                    </a>
                                ),
                            )}
                        </div>
                    </div>
                </div>

                <div className="pointer-events-auto ml-auto flex w-fit flex-col items-end gap-2">
                    <button
                        type="button"
                        aria-label={labels.scrollTop}
                        title={labels.scrollTop}
                        onClick={handleScrollToTop}
                        className={`flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-dark-umber/10 bg-off-white text-dark-umber shadow-[0_12px_24px_rgba(26,22,20,0.2)] transition-[transform,opacity,background-color,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80 motion-reduce:transition-none touch-manipulation [-webkit-tap-highlight-color:transparent] dark:border-off-white/10 dark:bg-off-white/10 dark:text-off-white ${isScrollTopVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                    >
                        <ChevronUp className="size-5" aria-hidden="true" focusable="false" />
                    </button>

                    <button
                        type="button"
                        aria-expanded={isMobileOpen}
                        aria-controls="sticky-contact-mobile-menu"
                        aria-label={isMobileOpen ? 'Close contact menu' : 'Open contact menu'}
                        onClick={() => setIsMobileOpen((current) => !current)}
                        className={`relative flex h-14 items-center justify-center rounded-full border border-dark-umber/10 bg-warm-gold text-dark-umber shadow-[0_16px_30px_rgba(26,22,20,0.24)] transition-[transform,background-color,box-shadow,color,width,padding] duration-300 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80 motion-reduce:transition-none touch-manipulation [-webkit-tap-highlight-color:transparent] dark:border-off-white/10 dark:bg-warm-gold dark:text-dark-umber ${isMobileOpen ? 'w-14 px-0' : 'w-auto px-6 gap-2'}`}
                    >
                        {!isMobileOpen && (
                            <span className="absolute inset-0 -z-10 animate-fab-pulse rounded-full"></span>
                        )}
                        <span className="sr-only">Toggle contact options</span>
                        {isMobileOpen ? (
                            <X
                                className="size-5 shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none"
                                aria-hidden="true"
                                focusable="false"
                            />
                        ) : (
                            <>
                                <Headphones
                                    className="size-5 shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none"
                                    aria-hidden="true"
                                    focusable="false"
                                />
                                <span className="font-bold uppercase tracking-widest text-[11px] whitespace-nowrap">
                                    {labels.trigger}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-50 hidden sm:block sm:right-6">
                <div className="pointer-events-none flex flex-col items-end gap-2.5">
                    <div
                        className={`pointer-events-auto rounded-[999px] border border-white/25 bg-white/75 p-3 shadow-[0_20px_60px_rgba(26,22,20,0.18)] backdrop-blur-2xl transition-[transform,opacity] duration-300 dark:border-white/10 dark:bg-dark-umber/70 dark:shadow-[0_20px_60px_rgba(26,22,20,0.45)] ${isScrollTopVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}
                    >
                        <button
                            type="button"
                            aria-label={labels.scrollTop}
                            title={labels.scrollTop}
                            onClick={handleScrollToTop}
                            className="group relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-dark-umber/10 bg-off-white text-dark-umber shadow-[0_14px_34px_rgba(26,22,20,0.2)] transition-[transform,background-color,color] duration-300 hover:-translate-y-0.5 hover:bg-warm-gold hover:text-dark-umber hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80 motion-reduce:transition-none touch-manipulation [-webkit-tap-highlight-color:transparent] dark:border-off-white/10 dark:bg-off-white/10 dark:text-off-white dark:hover:bg-warm-gold dark:hover:text-dark-umber"
                        >
                            <ChevronUp className="size-5" aria-hidden="true" focusable="false" />
                            <span className="pointer-events-none absolute right-13 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-dark-umber/10 bg-off-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-dark-umber opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 dark:border-off-white/10 dark:bg-dark-umber dark:text-off-white sm:block">
                                {labels.scrollTop}
                            </span>
                        </button>
                    </div>

                    <div className="relative pointer-events-auto flex flex-col gap-2 rounded-[999px] border border-white/25 bg-white/75 p-3 shadow-[0_20px_60px_rgba(26,22,20,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-dark-umber/70 dark:shadow-[0_20px_60px_rgba(26,22,20,0.45)]">
                        <span className="absolute inset-0 -z-10 animate-fab-pulse rounded-[999px]"></span>
                        {contactActions.map(({ key, href, labelKey, icon: Icon, external }) => (
                            <a
                                key={key}
                                href={href}
                                target={external ? '_blank' : undefined}
                                rel={external ? 'noreferrer' : undefined}
                                aria-label={labels[labelKey]}
                                title={labels[labelKey]}
                                className={`group relative flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80 motion-reduce:transition-none touch-manipulation [-webkit-tap-highlight-color:transparent] ${
                                    key === 'call'
                                        ? 'border-warm-gold bg-warm-gold text-dark-umber hover:brightness-110'
                                        : 'border-dark-umber/10 bg-off-white text-dark-umber hover:bg-warm-gold hover:text-dark-umber dark:border-off-white/10 dark:bg-off-white/10 dark:text-off-white dark:hover:bg-warm-gold dark:hover:text-dark-umber'
                                }`}
                            >
                                <Icon className="size-5" aria-hidden="true" focusable="false" />
                                <span className="pointer-events-none absolute right-13 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-dark-umber/10 bg-off-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-dark-umber opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 dark:border-off-white/10 dark:bg-dark-umber dark:text-off-white sm:block">
                                    {labels[labelKey]}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
