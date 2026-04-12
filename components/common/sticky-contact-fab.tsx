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
import { SiZalo } from 'react-icons/si';
import { contactInfo } from '@/lib/contact';

type ContactFabLabels = {
    call: string;
    sms: string;
    zalo: string;
    facebook: string;
    instagram: string;
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
            <div className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 pointer-events-none sm:hidden">
                <button
                    type="button"
                    aria-label={labels.scrollTop}
                    title={labels.scrollTop}
                    onClick={handleScrollToTop}
                    className={`pointer-events-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-dark-umber/10 bg-off-white text-dark-umber shadow-[0_12px_24px_rgba(26,22,20,0.2)] transition-[transform,opacity,background-color,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80 motion-reduce:transition-none touch-manipulation [-webkit-tap-highlight-color:transparent] dark:border-off-white/10 dark:bg-off-white/10 dark:text-off-white ${isScrollTopVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}
                >
                    <ChevronUp className="size-5" aria-hidden="true" focusable="false" />
                </button>
            </div>

            <div className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 pointer-events-none sm:hidden">
                <div className="pointer-events-auto ml-auto flex w-fit flex-col items-end gap-2">
                    <div
                        id="sticky-contact-mobile-menu"
                        className={`origin-bottom-right overflow-hidden rounded-[1.75rem] border border-white/35 bg-white/85 p-2 shadow-[0_18px_50px_rgba(26,22,20,0.18)] backdrop-blur-2xl transform-gpu will-change-transform transition-[transform,opacity] duration-280 ease-out motion-reduce:transition-none dark:border-white/10 dark:bg-dark-umber/80 dark:shadow-[0_18px_50px_rgba(26,22,20,0.5)] ${isMobileOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-95 opacity-0'}`}
                    >
                        <div className="flex flex-col gap-2">
                            {mobileMenuItems.map(
                                ({ key, href, labelKey, icon: Icon, external, delay }) => (
                                    <a
                                        key={key}
                                        href={href}
                                        target={external ? '_blank' : undefined}
                                        rel={external ? 'noreferrer' : undefined}
                                        aria-label={labels[labelKey]}
                                        title={labels[labelKey]}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`group relative flex h-12 min-w-48 items-center gap-3 rounded-2xl border border-dark-umber/10 bg-off-white px-4 text-dark-umber shadow-sm transition-[transform,background-color,color,opacity] duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80 motion-reduce:transition-none touch-manipulation [-webkit-tap-highlight-color:transparent] dark:border-off-white/10 dark:bg-off-white/10 dark:text-off-white dark:active:scale-[0.98] ${isMobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
                                        style={{
                                            transitionDelay: isMobileOpen ? `${delay}ms` : '0ms',
                                        }}
                                    >
                                        <Icon
                                            className="size-5 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transition-none"
                                            aria-hidden="true"
                                            focusable="false"
                                        />
                                        <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.14em] transition-opacity duration-200 ease-out motion-reduce:transition-none">
                                            {labels[labelKey]}
                                        </span>
                                    </a>
                                ),
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        aria-expanded={isMobileOpen}
                        aria-controls="sticky-contact-mobile-menu"
                        aria-label={isMobileOpen ? 'Close contact menu' : 'Open contact menu'}
                        onClick={() => setIsMobileOpen((current) => !current)}
                        className="flex h-14 w-14 items-center justify-center rounded-full border border-dark-umber/10 bg-warm-gold text-dark-umber shadow-[0_16px_30px_rgba(26,22,20,0.24)] transition-[transform,background-color,box-shadow,color] duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80 motion-reduce:transition-none touch-manipulation [-webkit-tap-highlight-color:transparent] dark:border-off-white/10 dark:bg-warm-gold dark:text-dark-umber"
                    >
                        <span className="sr-only">Toggle contact options</span>
                        {isMobileOpen ? (
                            <X
                                className="size-5 transition-transform duration-300 ease-out motion-reduce:transition-none"
                                aria-hidden="true"
                                focusable="false"
                            />
                        ) : (
                            <Headphones
                                className="size-5 transition-transform duration-300 ease-out motion-reduce:transition-none"
                                aria-hidden="true"
                                focusable="false"
                            />
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

                    <div className="pointer-events-auto flex flex-col gap-2 rounded-[999px] border border-white/25 bg-white/75 p-3 shadow-[0_20px_60px_rgba(26,22,20,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-dark-umber/70 dark:shadow-[0_20px_60px_rgba(26,22,20,0.45)]">
                        {contactActions.map(({ key, href, labelKey, icon: Icon, external }) => (
                            <a
                                key={key}
                                href={href}
                                target={external ? '_blank' : undefined}
                                rel={external ? 'noreferrer' : undefined}
                                aria-label={labels[labelKey]}
                                title={labels[labelKey]}
                                className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-dark-umber/10 bg-off-white text-dark-umber transition-colors duration-300 hover:-translate-y-0.5 hover:bg-warm-gold hover:text-dark-umber hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80 motion-reduce:transition-none touch-manipulation [-webkit-tap-highlight-color:transparent] dark:border-off-white/10 dark:bg-off-white/10 dark:text-off-white dark:hover:bg-warm-gold dark:hover:text-dark-umber"
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
