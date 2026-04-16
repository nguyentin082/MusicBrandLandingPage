import { getTranslations } from 'next-intl/server';
import { PlatformGrid } from './platform-grid';

interface Platform {
    name: string;
    icon: string;
}

export async function PartnersSection() {
    const t = await getTranslations('partners');
    const platforms = t.raw('platforms') as Platform[];
    const label = t('label');

    return (
        <section className="py-8 sm:py-12 md:py-16 bg-dark-umber dark:bg-dark-umber border-y border-dark-umber/5 dark:border-off-white/10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                <p className="text-xs sm:text-xs md:text-xs text-warm-gold dark:text-warm-gold uppercase font-black tracking-[0.4em] mb-6 sm:mb-8 md:mb-10 italic">
                    {label}
                </p>
                <PlatformGrid platforms={platforms} />
            </div>
        </section>
    );
}
