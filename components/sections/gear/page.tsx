import { getTranslations } from 'next-intl/server';

type GearTable = {
    title: string;
    items: {
        name: string;
        type: string;
    }[];
};

export async function GearSection() {
    const t = await getTranslations('gear');

    const tables = t.raw('tables') as GearTable[];
    const itemNameLabel = t('itemNameLabel');
    const itemTypeLabel = t('itemTypeLabel');

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

                <div className="mt-14 grid gap-10 md:grid-cols-2 xl:grid-cols-3">
                    {tables.map((table) => (
                        <div
                            key={table.title}
                            className="overflow-hidden rounded-4xl border border-dark-umber/5 bg-off-white shadow-[0_18px_45px_rgba(26,22,20,0.05)] dark:border-off-white/10 dark:bg-soft-brown dark:shadow-none"
                        >
                            <div className="border-b border-dark-umber/5 bg-dark-umber/3 px-6 py-5 dark:border-off-white/10 dark:bg-off-white/4 sm:px-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brick-red dark:text-warm-gold">
                                    {t('cardLabel')}
                                </p>
                                <h4 className="mt-2 text-2xl font-black italic tracking-tight text-dark-umber dark:text-off-white">
                                    {table.title}
                                </h4>
                            </div>

                            <dl className="divide-y divide-dark-umber/5 dark:divide-off-white/10">
                                {table.items.map((item, idx) => (
                                    <div
                                        key={`${table.title}-${idx}`}
                                        className="grid gap-4 px-6 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,auto)] sm:items-center sm:px-8"
                                    >
                                        <div className="min-w-0">
                                            <dt className="text-[10px] font-bold uppercase tracking-[0.28em] text-dark-umber/45 dark:text-off-white/45">
                                                {itemNameLabel}
                                            </dt>
                                            <dd className="mt-1 wrap-break-word text-base font-semibold not-italic text-dark-umber dark:text-off-white">
                                                {item.name}
                                            </dd>
                                        </div>

                                        <div className="sm:text-right">
                                            <dt className="text-[10px] font-bold uppercase tracking-[0.28em] text-dark-umber/45 dark:text-off-white/45">
                                                {itemTypeLabel}
                                            </dt>
                                            <dd className="mt-1 text-sm font-medium not-italic text-warm-gold">
                                                {item.type}
                                            </dd>
                                        </div>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
