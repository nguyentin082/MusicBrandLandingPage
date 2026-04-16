import { getTranslations } from 'next-intl/server';

export async function CTASection() {
    const t = await getTranslations('newsletter');

    return (
        <section className="py-16 sm:py-24 md:py-32 bg-warm-gold dark:bg-warm-gold px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-dark-umber text-xs font-black uppercase tracking-[0.4em] mb-4 sm:mb-6 italic">
                    {t('label')}
                </h2>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-dark-umber mb-6 sm:mb-8 italic">
                    {t('heading')}
                </h3>
                <p className="text-dark-umber/70 mb-8 sm:mb-10 italic font-medium leading-relaxed text-sm sm:text-base">
                    {t('description')}
                </p>
                <form className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto">
                    <input
                        type="email"
                        placeholder={t('placeholder')}
                        className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl bg-white/20 border border-dark-umber/20 focus:outline-none focus:border-dark-umber text-dark-umber italic text-sm placeholder:text-dark-umber/40"
                    />
                    <button className="px-6 sm:px-8 py-3 sm:py-4 bg-dark-umber text-off-white font-bold rounded-2xl hover:scale-105 transition italic whitespace-nowrap text-sm sm:text-base">
                        {t('cta')}
                    </button>
                </form>
            </div>
        </section>
    );
}
