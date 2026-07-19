import { getTranslations } from 'next-intl/server';
import { LeadForm } from './lead-form';

export async function CTASection() {
    const t = await getTranslations('ctaForm');

    return (
        <section className="py-16 sm:py-24 md:py-32 bg-warm-gold dark:bg-warm-gold px-4 sm:px-6 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-5xl mx-auto text-center relative z-10">
                <h2 className="text-dark-umber text-xs font-black uppercase tracking-[0.4em] mb-4 sm:mb-6 italic">
                    {t('label')}
                </h2>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-dark-umber mb-6 sm:mb-8 italic tracking-tight">
                    {t('heading')}
                </h3>
                <p className="text-dark-umber/70 mb-10 sm:mb-16 italic font-medium leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
                    {t('description')}
                </p>
                
                <LeadForm />
            </div>
        </section>
    );
}
