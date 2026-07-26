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
                <div className="mb-12 sm:mb-16">
                    <h2 className="text-brick-red dark:text-warm-gold text-xs font-black uppercase tracking-[0.4em] mb-4 italic">
                        {t('label')}
                    </h2>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-off-white tracking-tighter italic">
                        {t('heading')}
                    </h3>
                </div>
                <PlatformGrid platforms={platforms} />
            </div>
        </section>
    );
}
