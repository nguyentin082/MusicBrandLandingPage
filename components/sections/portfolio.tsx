import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export async function PortfolioSection() {
  const t = await getTranslations('portfolio');

  const projects = t.raw('projects') as any[];

  const projectImages = [
    'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
  ];

  return (
    <section
      id="portfolio"
      className="py-32 px-6 bg-off-white dark:bg-dark-umber"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-dark-umber dark:text-off-white tracking-tighter mb-16 italic text-center">
          {t('heading')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="aspect-square bg-dark-umber dark:bg-soft-brown rounded-[40px] overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300"
            >
              <Image
                src={projectImages[idx]}
                fill
                sizes="(max-width: 768px) 90vw, 30vw"
                loading="lazy"
                className="object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition duration-700"
                alt={project.title}
              />
              <div className="absolute inset-0 p-10 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-warm-gold text-xs font-bold italic mb-2 uppercase tracking-widest">
                  {project.genre}
                </p>
                <h4 className="text-off-white font-bold text-2xl italic">
                  {project.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
