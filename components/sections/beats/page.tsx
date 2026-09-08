import { getTranslations } from 'next-intl/server';
import { BeatPlayer } from './beat-player';
import type { BeatTrack } from './types';
import { resolveMediaUrl, toAbsoluteUrl } from '@/lib/media';
import { siteConfig } from '@/lib/site';

export async function BeatsSection() {
    const t = await getTranslations('beats');

    const items = t.raw('items') as Omit<BeatTrack, 'src'>[];
    
    // We hardcode the URLs here based on the instructions, or we could add them to the translation file if needed.
    // However, keeping them here ensures they match the uploaded R2 paths exactly.
    const audioUrls = [
        resolveMediaUrl('/audio/IfaintgotyouMasterBeat1stFixed.mp3'),
        resolveMediaUrl('/audio/ZenithBeat.mp3'),
    ];

    const tracks: BeatTrack[] = items.map((item, index) => ({
        ...item,
        src: audioUrls[index] || '',
    }));

    const beatsJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: t('heading'),
        itemListElement: tracks.map((track, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'MusicRecording',
                name: track.title,
                genre: track.genre,
                description: track.description,
                byArtist: {
                    '@type': 'MusicGroup',
                    name: '2LAB',
                },
                url: toAbsoluteUrl(track.src, siteConfig.url),
            },
        })),
    };

    return (
        <section className="py-24 px-6 bg-off-white dark:bg-soft-brown">
            {/* Preload beat audio files so browser fetches them early in parallel */}
            {tracks.map((track) => (
                <link
                    key={track.src}
                    rel="preload"
                    as="audio"
                    href={track.src}
                    type="audio/mpeg"
                />
            ))}

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-brick-red dark:text-warm-gold text-xs font-black uppercase tracking-[0.4em] mb-4 italic">
                        {t('label')}
                    </h2>
                    <h3 className="text-4xl font-extrabold text-dark-umber dark:text-off-white tracking-tighter italic">
                        {t('heading')}
                    </h3>
                </div>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(beatsJsonLd) }}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {tracks.map((track, index) => (
                        <BeatPlayer
                            key={`beat-${index}`}
                            track={track}
                            playButton={t('playButton')}
                            pauseButton={t('pauseButton')}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
