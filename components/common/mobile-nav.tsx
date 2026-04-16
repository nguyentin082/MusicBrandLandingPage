'use client';

import { useState } from 'react';
import {
    ArrowRight,
    BadgeDollarSign,
    BookOpen,
    Disc3,
    Mail,
    Menu,
    Music2,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

const drawerPanelClassName =
    'w-[92vw] max-w-sm border-l border-brick-red/10 bg-[linear-gradient(180deg,rgba(251,246,240,0.98)_0%,rgba(245,237,228,0.96)_100%)] px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))] shadow-2xl shadow-black/10 dark:border-off-white/10 dark:bg-[linear-gradient(180deg,rgba(33,24,18,0.98)_0%,rgba(24,18,14,0.98)_100%)]';

const drawerHeaderCloseClassName =
    'absolute right-0 top-0 inline-flex h-12 w-12 items-center justify-center rounded-full border border-brick-red/15 bg-white/90 text-dark-umber shadow-[0_12px_28px_-18px_rgba(139,57,41,0.65)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_36px_-18px_rgba(139,57,41,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick-red focus-visible:ring-offset-2 dark:border-off-white/10 dark:bg-white/5 dark:text-off-white dark:hover:bg-white/10';

const drawerLinkClassName =
    'group flex items-center justify-between rounded-3xl border border-transparent bg-white/80 px-4 py-4 text-dark-umber shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brick-red/15 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick-red focus-visible:ring-offset-2 dark:bg-white/5 dark:text-off-white dark:hover:border-off-white/10 dark:hover:bg-white/10';

const drawerCtaClassName =
    'mt-2 inline-flex items-center justify-between rounded-3xl bg-brick-red px-4 py-4 text-off-white shadow-[0_18px_42px_-24px_rgba(139,57,41,0.85)] transition hover:-translate-y-0.5 hover:bg-brick-red/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick-red focus-visible:ring-offset-2';

export function MobileNav() {
    const t = useTranslations('navigation');
    const locale = useLocale();
    const [open, setOpen] = useState(false);

    const navigationItems = [
        { href: '#services', icon: Music2, key: 'services' },
        { href: '#portfolio', icon: Disc3, key: 'portfolio' },
        { href: '#gear', icon: SlidersHorizontal, key: 'gear' },
        { href: '#pricing', icon: BadgeDollarSign, key: 'pricing' },
        { href: `/${locale}/blog`, icon: BookOpen, key: 'blog' },
    ] as const;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-dark-umber/10 bg-white/80 text-dark-umber shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick-red focus-visible:ring-offset-2 dark:border-off-white/10 dark:bg-white/5 dark:text-off-white dark:hover:bg-white/10"
                    aria-label="Open navigation menu"
                    aria-expanded={open}
                    aria-controls="mobile-nav"
                    type="button"
                    style={{
                        touchAction: 'manipulation',
                    }}
                >
                    <Menu className="size-5" />
                </button>
            </SheetTrigger>
            <SheetContent side="right" showCloseButton={false} className={drawerPanelClassName}>
                <div className="flex h-full flex-col gap-6">
                    <div className="relative flex items-start justify-between gap-4 pr-14">
                        <div className="min-w-0">
                            <p className="truncate text-lg font-black tracking-tighter text-dark-umber dark:text-off-white">
                                {t('logo')}
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-soft-brown/90 dark:text-off-white/55">
                                Sound Studio
                            </p>
                        </div>

                        <SheetClose asChild>
                            <button
                                type="button"
                                aria-label="Close navigation menu"
                                className={drawerHeaderCloseClassName}
                            >
                                <X className="size-5" />
                            </button>
                        </SheetClose>
                    </div>

                    <nav id="mobile-nav" className="flex flex-1 flex-col gap-2">
                        {navigationItems.map(({ href, icon: Icon, key }) => (
                            <SheetClose asChild key={href}>
                                <a href={href} className={drawerLinkClassName}>
                                    <span className="flex items-center gap-3">
                                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brick-red/10 text-brick-red transition group-hover:bg-brick-red group-hover:text-off-white dark:bg-white/10 dark:text-off-white">
                                            <Icon className="size-4" />
                                        </span>
                                        <span className="text-sm font-bold uppercase tracking-[0.22em]">
                                            {t(key)}
                                        </span>
                                    </span>
                                    <ArrowRight className="size-4 text-soft-brown transition group-hover:translate-x-0.5 group-hover:text-brick-red dark:text-off-white/50 dark:group-hover:text-off-white" />
                                </a>
                            </SheetClose>
                        ))}

                        <SheetClose asChild>
                            <a href="#contact" className={drawerCtaClassName}>
                                <span className="flex items-center gap-3">
                                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                                        <Mail className="size-4" />
                                    </span>
                                    <span className="text-sm font-bold uppercase tracking-[0.22em]">
                                        {t('contact')}
                                    </span>
                                </span>
                                <ArrowRight className="size-4 text-off-white/80" />
                            </a>
                        </SheetClose>
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );
}
