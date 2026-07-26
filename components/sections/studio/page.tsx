import { getTranslations } from 'next-intl/server';
import { Coffee, Sofa, Wind, Music } from 'lucide-react';

export async function StudioSection() {
    const t = await getTranslations('studio');

    const amenities = t.raw('amenities') as string[];
    const amenityIcons = [Coffee, Sofa, Wind, Music];

    return (
        <section className="py-16 sm:py-24 md:py-32 bg-dark-umber dark:bg-dark-umber text-off-white dark:text-off-white px-4 sm:px-6 overflow-hidden">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-warm-gold text-xs font-black uppercase tracking-[0.4em] mb-3 sm:mb-4 italic">
                    {t('label')}
                </h2>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 sm:mb-8 italic">
                    {t('heading')}
                </h3>
                <p className="text-off-white/50 mb-8 sm:mb-10 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
                    {t('description')}
                </p>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-warm-gold">
                    <span>{t('features.acoustics')}</span>
                    <span className="hidden sm:inline text-off-white/20">•</span>
                    <span>{t('features.vibe')}</span>
                    <span className="hidden sm:inline text-off-white/20">•</span>
                    <span>{t('features.gear')}</span>
                    <span className="hidden sm:inline text-off-white/20">•</span>
                    <span>{t('features.workflow')}</span>
                </div>
            </div>
        </section>
    );
}
