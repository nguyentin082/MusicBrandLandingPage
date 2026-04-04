import { getTranslations } from 'next-intl/server';

export async function PartnersSection() {
    const t = await getTranslations('partners');

    const platforms = t.raw('platforms') as string[];

    return (
        <section className="py-16 bg-dark-umber dark:bg-dark-umber border-y border-dark-umber/5 dark:border-off-white/10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-[10px] text-warm-gold dark:text-warm-gold uppercase font-black tracking-[0.4em] mb-10 italic">
                    {t('label')}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 hover:opacity-60 transition duration-500 font-black italic text-xl text-off-white dark:text-off-white">
                    {platforms.map((platform, idx) => (
                        <span key={idx} className="whitespace-nowrap">
                            {platform}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
