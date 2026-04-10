import { getTranslations } from 'next-intl/server';

export async function PhilosophySection() {
    const t = await getTranslations('philosophy');

    return (
        <section className="py-32 px-6 bg-off-white dark:bg-soft-brown border-b border-dark-umber/5 dark:border-off-white/10 animate-fade-in">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-brick-red dark:text-warm-gold text-xs font-black uppercase tracking-[0.4em] mb-12 italic">
                    {t('label')}
                </h2>
                <p className="text-3xl md:text-5xl font-extrabold text-dark-umber dark:text-off-white leading-tight tracking-tighter mb-10 italic">
                    &ldquo;{t('quote')}&rdquo;
                </p>
                <p className="text-soft-brown dark:text-off-white/50 text-lg font-light leading-relaxed italic">
                    {t('description')}
                </p>
            </div>
        </section>
    );
}
