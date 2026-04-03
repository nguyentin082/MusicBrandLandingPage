import { getTranslations } from 'next-intl/server';

export async function StatsSection() {
  const t = await getTranslations('stats');

  const stats = [
    { key: 'projects', icon: '📊' },
    { key: 'artists', icon: '🎤' },
    { key: 'streams', icon: '▶️' },
    { key: 'experience', icon: '⭐' },
  ];

  return (
    <section className="py-20 bg-white dark:bg-dark-umber">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
        {stats.map(({ key, icon }) => {
          return (
            <div key={key}>
              <div className="text-4xl mb-2">{icon}</div>
              <div className="text-4xl md:text-5xl font-black text-dark-umber dark:text-off-white mb-2 italic">
                {t(`${key}.number` as any)}
              </div>
              <p className="text-[10px] text-warm-gold dark:text-warm-gold font-bold uppercase tracking-widest italic">
                {t(`${key}.label` as any)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
