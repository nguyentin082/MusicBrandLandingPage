import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/media';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

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

    const gearGallery = [
        {
            src: resolveMediaUrl('/image/studio/studio-3.jpg'),
            alt: 'Studio control room with monitors',
            className: 'col-span-2 row-span-2 md:col-span-4 md:row-span-4',
            sizes: '(max-width: 768px) 92vw, (max-width: 1024px) 52vw, 32vw',
        },
        {
            src: resolveMediaUrl('/image/studio/studio-2.jpg'),
            alt: 'Microphone setup in recording booth',
            className: 'col-span-1 row-span-1 md:col-span-2 md:row-span-2',
            sizes: '(max-width: 768px) 44vw, (max-width: 1024px) 26vw, 16vw',
        },
        {
            src: resolveMediaUrl('/image/studio/studio-1.jpg'),
            alt: 'Acoustic treatment and ambient lights',
            className: 'col-span-1 row-span-1 md:col-span-2 md:row-span-2',
            sizes: '(max-width: 768px) 44vw, (max-width: 1024px) 26vw, 16vw',
        },
        {
            src: resolveMediaUrl('/image/studio/studio-4.jpg'),
            alt: 'Artist lounge area in the studio',
            className: 'col-span-2 row-span-2 md:col-span-6 md:row-span-2',
            sizes: '(max-width: 768px) 92vw, (max-width: 1024px) 52vw, 44vw',
        },
    ];

    return (
        <section
            id="gear"
            className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-white dark:bg-dark-umber overflow-hidden"
        >
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 sm:gap-16 md:gap-20 items-center">
                <div className="relative order-2 lg:order-1">
                    <div className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-brick-red/5 dark:bg-warm-gold/10 blur-3xl" />
                    <div className="relative grid grid-cols-2 md:grid-cols-6 auto-rows-[120px] md:auto-rows-[88px] gap-4 md:gap-5">
                        {gearGallery.map((image, idx) => (
                            <div
                                key={idx}
                                className={`${image.className} relative rounded-3xl overflow-hidden border border-dark-umber/10 dark:border-off-white/15 bg-dark-umber/5 dark:bg-soft-brown/30 shadow-2xl group`}
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

                <div className="order-1 lg:order-2">
                    <h2 className="text-brick-red dark:text-warm-gold text-xs font-black uppercase tracking-[0.4em] mb-3 sm:mb-4 italic">
                        {t('label')}
                    </h2>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-dark-umber dark:text-off-white tracking-tighter mb-8 sm:mb-10 italic">
                        {t('heading')}
                    </h3>

                    <Accordion type="single" collapsible defaultValue={tables[0]?.title} className="flex flex-col gap-4 sm:gap-5 w-full">
                        {tables.map((table) => (
                            <AccordionItem
                                value={table.title}
                                key={table.title}
                                className="overflow-hidden rounded-3xl border-b-0 border border-dark-umber/5 bg-off-white shadow-[0_8px_30px_rgba(26,22,20,0.04)] dark:border-off-white/10 dark:bg-soft-brown dark:shadow-none transition-all duration-500 hover:border-brick-red/40 hover:shadow-[0_0_20px_rgba(178,58,72,0.15)] dark:hover:border-warm-gold/50 dark:hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] data-[state=open]:border-brick-red/40 data-[state=open]:shadow-[0_0_20px_rgba(178,58,72,0.15)] dark:data-[state=open]:border-warm-gold/50 dark:data-[state=open]:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                            >
                                <AccordionTrigger className="hover:no-underline cursor-pointer items-center border-b border-transparent data-[state=open]:border-dark-umber/5 dark:data-[state=open]:border-off-white/10 bg-dark-umber/3 px-6 py-5 dark:bg-off-white/4 sm:px-8 [&>svg]:text-brick-red dark:[&>svg]:text-warm-gold [&>svg]:size-5 transition-colors duration-300">
                                    <div className="flex flex-col text-left">
                                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brick-red dark:text-warm-gold transition-colors duration-300">
                                            {t('cardLabel')}
                                        </p>
                                        <h4 className="mt-1 sm:mt-2 text-xl font-black italic tracking-tight text-dark-umber dark:text-off-white transition-colors duration-300">
                                            {table.title}
                                        </h4>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="p-0">
                                    <dl className="divide-y divide-dark-umber/5 dark:divide-off-white/10">
                                        {table.items.map((item, idx) => (
                                            <div
                                                key={`${table.title}-${idx}`}
                                                className="grid gap-2 sm:gap-4 px-6 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,auto)] sm:items-center sm:px-8"
                                            >
                                                <div className="min-w-0">
                                                    <dt className="text-[10px] font-bold uppercase tracking-[0.28em] text-dark-umber/45 dark:text-off-white/45">
                                                        {itemNameLabel}
                                                    </dt>
                                                    <dd className="mt-1 wrap-break-word text-sm font-semibold not-italic text-dark-umber dark:text-off-white">
                                                        {item.name}
                                                    </dd>
                                                </div>

                                                <div className="sm:text-right">
                                                    <dt className="text-[10px] font-bold uppercase tracking-[0.28em] text-dark-umber/45 dark:text-off-white/45">
                                                        {itemTypeLabel}
                                                    </dt>
                                                    <dd className="mt-1 text-xs font-medium not-italic text-brick-red dark:text-warm-gold">
                                                        {item.type}
                                                    </dd>
                                                </div>
                                            </div>
                                        ))}
                                    </dl>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
