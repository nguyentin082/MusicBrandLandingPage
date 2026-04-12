import { getTranslations } from 'next-intl/server';

export async function GearSection() {
    const t = await getTranslations('gear');

    const equipment = t.raw('equipment') as any[];
    const mics = equipment.slice(0, 3);
    const processing = equipment.slice(3, 6);

    return (
        <section id="gear" className="py-32 px-6 bg-white dark:bg-dark-umber">
            <div className="max-w-7xl mx-auto">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-brick-red dark:text-warm-gold text-xs font-black uppercase tracking-[0.4em] mb-4 italic">
                        {t('label')}
                    </h2>
                    <h3 className="text-4xl font-extrabold text-dark-umber dark:text-off-white tracking-tighter mb-8 italic">
                        {t('heading')}
                    </h3>
                    <p className="text-soft-brown dark:text-off-white/60 italic leading-relaxed">
                        {t('description')}
                    </p>
                </div>

                <div className="mt-14 grid gap-10 md:grid-cols-2">
                    <div className="p-8 bg-off-white dark:bg-soft-brown border border-dark-umber/5 dark:border-off-white/10 rounded-4xl">
                        <h4 className="font-bold mb-6 text-brick-red dark:text-warm-gold uppercase tracking-widest text-[10px] italic">
                            {t('microphones')}
                        </h4>
                        <ul className="space-y-4 text-sm font-light italic">
                            {mics.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="flex justify-between border-b border-dark-umber/5 dark:border-off-white/10 pb-2 text-dark-umber dark:text-off-white"
                                >
                                    <span>{item.name}</span>
                                    <span className="text-warm-gold">{item.type}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-8 bg-off-white dark:bg-soft-brown border border-dark-umber/5 dark:border-off-white/10 rounded-4xl">
                        <h4 className="font-bold mb-6 text-brick-red dark:text-warm-gold uppercase tracking-widest text-[10px] italic">
                            {t('processing')}
                        </h4>
                        <ul className="space-y-4 text-sm font-light italic">
                            {processing.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="flex justify-between border-b border-dark-umber/5 dark:border-off-white/10 pb-2 text-dark-umber dark:text-off-white"
                                >
                                    <span>{item.name}</span>
                                    <span className="text-warm-gold">{item.type}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}