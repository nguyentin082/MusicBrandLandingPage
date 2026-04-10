import { getTranslations } from 'next-intl/server';
import { Coffee, Sofa, Wind, Music } from 'lucide-react';
import Image from 'next/image';

export async function StudioSection() {
    const t = await getTranslations('studio');

    const amenities = t.raw('amenities') as string[];

    const iconMap = {
        'Specialty Coffee': Coffee,
        'Chill Zone': Sofa,
        'Air Purification': Wind,
        'Hi-Fi Monitoring': Music,
    };

    const studioImages = [
        'https://picsum.photos/seed/studio-1/800/600',
        'https://picsum.photos/seed/studio-2/800/600',
        'https://picsum.photos/seed/studio-3/800/600',
        'https://picsum.photos/seed/studio-4/800/600',
    ];

    return (
        <section className="py-32 bg-dark-umber dark:bg-dark-umber text-off-white dark:text-off-white px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                <div className="grid grid-cols-2 gap-4">
                    {studioImages.map((url, idx) => (
                        <div
                            key={idx}
                            className={`${
                                idx === 0 || idx === 3 ? 'aspect-video' : 'aspect-square'
                            } bg-soft-brown rounded-3xl overflow-hidden group cursor-pointer relative hover:scale-105 transition-transform duration-300 ${
                                idx === 1 ? 'translate-y-12' : idx === 2 ? '-translate-y-12' : ''
                            }`}
                        >
                            <Image
                                src={url}
                                fill
                                sizes="(max-width: 768px) 45vw, 20vw"
                                loading="lazy"
                                className="object-cover grayscale group-hover:grayscale-0 transition duration-700"
                                alt={`Studio photo ${idx + 1}`}
                            />
                        </div>
                    ))}
                </div>

                <div>
                    <h2 className="text-warm-gold text-xs font-black uppercase tracking-[0.4em] mb-4 italic">
                        {t('label')}
                    </h2>
                    <h3 className="text-4xl font-extrabold mb-8 italic">{t('heading')}</h3>
                    <p className="text-off-white/50 mb-10 leading-relaxed italic">
                        {t('description')}
                    </p>
                    <div className="grid grid-cols-2 gap-6 text-xs font-bold uppercase tracking-widest text-warm-gold italic">
                        {amenities.map((amenity, idx) => {
                            const IconComponent = iconMap[amenity as keyof typeof iconMap];
                            return (
                                <div key={idx} className="flex items-center gap-2">
                                    {IconComponent && <IconComponent className="w-4 h-4" />}
                                    <span>{amenity}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
