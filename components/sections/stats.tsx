import { getTranslations } from 'next-intl/server';

export async function StatsSection() {
    const t = await getTranslations('stats');

    const stats = [
        { key: 'projects' },
        { key: 'artists' },
        { key: 'streams' },
        { key: 'experience' },
    ];

    return (
        <section className="py-20 bg-warm-gold dark:bg-warm-gold">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    {stats.map(({ key }) => {
                        return (
                            <div key={key}>
                                <div className="text-7xl md:text-8xl font-black text-dark-umber mb-4 italic">
                                    {t(`${key}.number` as string)}
                                </div>
                                <p className="text-[10px] text-dark-umber/70 font-bold uppercase tracking-widest italic">
                                    {t(`${key}.label` as string)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
