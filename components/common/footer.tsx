'use client';

import { Copy, ExternalLink, MapPin, Navigation } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { contactInfo } from '@/lib/contact';

export function Footer() {
    const t = useTranslations('footer');
    const currentYear = new Date().getFullYear();
    const [isAddressCopied, setIsAddressCopied] = useState(false);

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(contactInfo.map.address);
            setIsAddressCopied(true);
            window.setTimeout(() => setIsAddressCopied(false), 1600);
        } catch {
            setIsAddressCopied(false);
        }
    };

    return (
        <footer
            id="contact"
            className="bg-dark-umber px-4 pb-10 pt-20 text-off-white dark:bg-dark-umber dark:text-off-white sm:px-6 sm:pt-32 sm:pb-12"
        >
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 space-y-10 lg:mb-20 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16 lg:space-y-0 sm:mb-20 sm:space-y-12">
                    <div className="max-w-2xl">
                        <h3 className="mb-4 text-3xl font-black italic tracking-tighter sm:text-4xl">
                            {t('companyName')}
                        </h3>
                        <p className="mb-6 text-sm font-bold uppercase tracking-widest text-warm-gold sm:mb-8">
                            {t('tagline')}
                        </p>
                        <p className="max-w-xl text-sm leading-relaxed italic text-off-white/60 sm:text-base">
                            Premium sound studio specializing in recording, mixing, and mastering
                            for independent artists worldwide.
                        </p>
                    </div>

                    <div className="w-full lg:self-start">
                        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-sm">
                            <div className="relative aspect-11/10 border-b border-white/10 bg-black/20 sm:aspect-16/10">
                                <iframe
                                    title={contactInfo.map.title}
                                    src={contactInfo.map.embedUrl}
                                    className="h-full w-full"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allowFullScreen
                                    allow="geolocation; clipboard-write"
                                />

                                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-dark-umber/70 via-transparent to-dark-umber/10" />

                                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-5">
                                    <div className="max-w-[70%] rounded-full border border-white/10 bg-dark-umber/75 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-warm-gold backdrop-blur-md">
                                        {t('contact.mapLabel')}
                                    </div>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 hidden p-4 sm:block sm:p-5">
                                    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-dark-umber/70 p-2 backdrop-blur-md">
                                        <a
                                            href={contactInfo.map.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-[11px] font-bold uppercase tracking-widest text-off-white transition-colors hover:bg-white/10 hover:text-warm-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80"
                                        >
                                            <ExternalLink
                                                className="size-3.5"
                                                aria-hidden="true"
                                                focusable="false"
                                            />
                                            {t('contact.openInMaps')}
                                        </a>
                                        <a
                                            href={contactInfo.map.directionsUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-[11px] font-bold uppercase tracking-widest text-off-white transition-colors hover:bg-white/10 hover:text-warm-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80"
                                        >
                                            <Navigation
                                                className="size-3.5"
                                                aria-hidden="true"
                                                focusable="false"
                                            />
                                            {t('contact.directions')}
                                        </a>
                                        <button
                                            type="button"
                                            onClick={handleCopyAddress}
                                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-[11px] font-bold uppercase tracking-widest text-off-white transition-colors hover:bg-white/10 hover:text-warm-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80"
                                        >
                                            <Copy
                                                className="size-3.5"
                                                aria-hidden="true"
                                                focusable="false"
                                            />
                                            {isAddressCopied
                                                ? t('contact.copied')
                                                : t('contact.copyAddress')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="border-b border-white/10 p-3 sm:hidden">
                                <div className="grid grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-dark-umber/60 p-2">
                                    <a
                                        href={contactInfo.map.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-[11px] font-bold uppercase tracking-widest text-off-white transition-colors hover:bg-white/10 hover:text-warm-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80"
                                    >
                                        <ExternalLink
                                            className="size-3.5"
                                            aria-hidden="true"
                                            focusable="false"
                                        />
                                        {t('contact.openInMaps')}
                                    </a>
                                    <a
                                        href={contactInfo.map.directionsUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-[11px] font-bold uppercase tracking-widest text-off-white transition-colors hover:bg-white/10 hover:text-warm-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80"
                                    >
                                        <Navigation
                                            className="size-3.5"
                                            aria-hidden="true"
                                            focusable="false"
                                        />
                                        {t('contact.directions')}
                                    </a>
                                    <button
                                        type="button"
                                        onClick={handleCopyAddress}
                                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-[11px] font-bold uppercase tracking-widest text-off-white transition-colors hover:bg-white/10 hover:text-warm-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80"
                                    >
                                        <Copy
                                            className="size-3.5"
                                            aria-hidden="true"
                                            focusable="false"
                                        />
                                        {isAddressCopied
                                            ? t('contact.copied')
                                            : t('contact.copyAddress')}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 p-5 text-sm text-off-white/75 sm:p-6 sm:space-y-3">
                                <p className="flex items-start gap-3 px-3 py-2 text-off-white/60">
                                    <MapPin
                                        className="mt-0.5 size-4 shrink-0 text-warm-gold"
                                        aria-hidden="true"
                                        focusable="false"
                                    />
                                    <span>{contactInfo.map.address}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-off-white/10 pt-6 text-center text-xs text-off-white/50 sm:pt-8 sm:text-left">
                    {t('copyright', { year: currentYear })}
                </div>
            </div>
        </footer>
    );
}
