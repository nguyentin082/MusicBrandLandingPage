import { getTranslations } from 'next-intl/server';
import { Coffee, Sofa, Wind, Music } from 'lucide-react';
import Image from 'next/image';

export async function StudioSection() {
    const t = await getTranslations('studio');

    const amenities = t.raw('amenities') as string[];
    const amenityIcons = [Coffee, Sofa, Wind, Music];

    const studioGallery = [
        {
            src: '/image/studio/studio-3.jpg',
            alt: 'Studio control room with monitors',
            className: 'col-span-2 row-span-2 md:col-span-4 md:row-span-4',
            sizes: '(max-width: 768px) 92vw, (max-width: 1024px) 52vw, 32vw',
        },
        {
            src: '/image/studio/studio-2.jpg',
            alt: 'Microphone setup in recording booth',
            className: 'col-span-1 row-span-1 md:col-span-2 md:row-span-2',
            sizes: '(max-width: 768px) 44vw, (max-width: 1024px) 26vw, 16vw',
        },
        {
            src: '/image/studio/studio-1.jpg',
            alt: 'Acoustic treatment and ambient lights',
            className: 'col-span-1 row-span-1 md:col-span-2 md:row-span-2',
            sizes: '(max-width: 768px) 44vw, (max-width: 1024px) 26vw, 16vw',
        },
        {
            src: '/image/studio/studio-4.jpg',
            alt: 'Artist lounge area in the studio',
            className: 'col-span-2 row-span-2 md:col-span-6 md:row-span-2',
            sizes: '(max-width: 768px) 92vw, (max-width: 1024px) 52vw, 44vw',
        },
    ];

    return (
        <section className="py-32 bg-dark-umber dark:bg-dark-umber text-off-white dark:text-off-white px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                <div className="relative">
                    <div className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-warm-gold/10 blur-3xl" />
                    <div className="relative grid grid-cols-2 md:grid-cols-6 auto-rows-[120px] md:auto-rows-[88px] gap-4 md:gap-5">
                        {studioGallery.map((image, idx) => (
                            <div
                                key={idx}
                                className={`${image.className} relative rounded-3xl overflow-hidden border border-off-white/15 bg-soft-brown/30 shadow-2xl group`}
                            >
                                <Image
                                    src={image.src}
                                    fill
                                    priority={idx === 0}
                                    sizes={image.sizes}
                                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-700"
                                    alt={image.alt}
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-dark-umber/35 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                            </div>
                        ))}
                    </div>
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
                            const IconComponent = amenityIcons[idx % amenityIcons.length];
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
