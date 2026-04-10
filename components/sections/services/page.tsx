import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, Mic2, Music, Layers } from 'lucide-react';

export async function ServicesSection() {
    const t = await getTranslations('services');

    const services = [
        {
            icon: Mic2,
            key: 'recording',
            title: t('recording.title'),
            description: t('recording.description'),
        },
        {
            icon: Music,
            key: 'production',
            title: t('production.title'),
            description: t('production.description'),
        },
        {
            icon: Layers,
            key: 'mixing',
            title: t('mixing.title'),
            description: t('mixing.description'),
        },
    ];

    return (
        <section id="services" className="py-32 px-6 bg-white dark:bg-dark-umber">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-16 text-center text-dark-umber dark:text-off-white italic">
                    {t('heading')}
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {services.map(({ icon: Icon, key, title, description }) => (
                        <div
                            key={key}
                            className="p-10 rounded-[40px] bg-off-white dark:bg-soft-brown border border-dark-umber/5 dark:border-off-white/10 hover:border-warm-gold/30 dark:hover:border-warm-gold/30 transition-all duration-500 group hover:-translate-y-1"
                        >
                            <div className="w-16 h-16 bg-white dark:bg-dark-umber rounded-2xl flex items-center justify-center mb-8 text-brick-red group-hover:bg-warm-gold/10 transition">
                                <Icon className="w-8 h-8" />
                            </div>
                            <h4 className="text-2xl font-bold text-dark-umber dark:text-off-white mb-4 italic">
                                {title}
                            </h4>
                            <p className="text-soft-brown dark:text-off-white/70 text-sm italic leading-relaxed">
                                {description}
                            </p>
                            <Link
                                href="#contact"
                                className="mt-8 inline-flex items-center gap-2 rounded-full border border-dark-umber/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-dark-umber transition-all duration-300 hover:-translate-y-0.5 hover:border-warm-gold/40 hover:bg-warm-gold hover:text-dark-umber dark:border-off-white/10 dark:bg-dark-umber dark:text-off-white dark:hover:bg-warm-gold dark:hover:text-dark-umber"
                            >
                                {t('consultNow')}
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
