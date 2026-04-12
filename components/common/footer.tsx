import { Mail, MapPin, PhoneCall } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { contactInfo } from '@/lib/contact';

export function Footer() {
    const t = useTranslations('footer');
    const currentYear = new Date().getFullYear();

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
                        <div className="w-full rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
                            <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-warm-gold">
                                {t('contact.label')}
                            </h4>
                            <div className="space-y-2 text-sm text-off-white/75 sm:space-y-3">
                                <a
                                    href={contactInfo.links.call}
                                    className="flex min-h-11 items-center gap-3 rounded-2xl px-3 transition-colors hover:bg-white/5 hover:text-warm-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80"
                                >
                                    <PhoneCall
                                        className="size-4 shrink-0 text-warm-gold"
                                        aria-hidden="true"
                                        focusable="false"
                                    />
                                    {t('contact.phone')}
                                </a>
                                <a
                                    href={`mailto:${contactInfo.email}`}
                                    className="flex min-h-11 items-center gap-3 rounded-2xl px-3 transition-colors hover:bg-white/5 hover:text-warm-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80"
                                >
                                    <Mail
                                        className="size-4 shrink-0 text-warm-gold"
                                        aria-hidden="true"
                                        focusable="false"
                                    />
                                    {t('contact.email')}
                                </a>
                                <p className="flex items-start gap-3 px-3 py-2 text-off-white/60">
                                    <MapPin
                                        className="mt-0.5 size-4 shrink-0 text-warm-gold"
                                        aria-hidden="true"
                                        focusable="false"
                                    />
                                    <span>{t('contact.address')}</span>
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
