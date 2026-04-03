import { useTranslations } from 'next-intl';

export function Footer() {
    const t = useTranslations('footer');

    return (
        <footer
            id="contact"
            className="bg-dark-umber text-off-white pt-32 pb-12 px-6 dark:bg-dark-umber dark:text-off-white"
        >
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-20 mb-20">
                    <div>
                        <h3 className="text-3xl font-black mb-4 italic tracking-tighter">
                            {t('companyName')}
                        </h3>
                        <p className="text-warm-gold text-sm font-bold uppercase tracking-widest mb-8">
                            {t('tagline')}
                        </p>
                        <p className="text-off-white/50 leading-relaxed italic">
                            Premium sound studio specializing in recording, mixing, and mastering
                            for independent artists worldwide.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-12">
                        <div>
                            <h4 className="font-bold text-warm-gold uppercase text-[10px] tracking-widest mb-6">
                                {t('contact.label')}
                            </h4>
                            <div className="space-y-3 text-sm text-off-white/70">
                                <a
                                    href="tel:+84987654321"
                                    className="block hover:text-warm-gold transition"
                                >
                                    {t('contact.phone')}
                                </a>
                                <a
                                    href="mailto:hello@wavvietnam.studio"
                                    className="block hover:text-warm-gold transition"
                                >
                                    {t('contact.email')}
                                </a>
                                <p>{t('contact.address')}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-warm-gold uppercase text-[10px] tracking-widest mb-6">
                                Links
                            </h4>
                            <div className="space-y-2 text-sm text-off-white/70">
                                <a
                                    href="#services"
                                    className="block hover:text-warm-gold transition"
                                >
                                    {t('links.services')}
                                </a>
                                <a
                                    href="#portfolio"
                                    className="block hover:text-warm-gold transition"
                                >
                                    {t('links.portfolio')}
                                </a>
                                <a
                                    href="#contact"
                                    className="block hover:text-warm-gold transition"
                                >
                                    {t('links.contact')}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-off-white/10 pt-8 text-center text-off-white/50 text-xs">
                    {t('copyright')}
                </div>
            </div>
        </footer>
    );
}
