import { getTranslations } from 'next-intl/server';
import { AudioToggle } from './audio-toggle';
import { AudioTrack } from './types';
import { resolveMediaUrl } from '@/lib/media';

type ComparisonItem = {
    key: string;
    trackTitle: string;
    tracks: AudioTrack[];
};

export async function AudioComparisonSection() {
    const t = await getTranslations('audioComparison');

    const comparisonItems: ComparisonItem[] = [
        {
            key: 'die-on-this-hill',
            trackTitle: t('trackTitleDieOnThisHill'),
            tracks: [
                {
                    id: 'raw',
                    label: t('rawButton'),
                    src: resolveMediaUrl('/audio/die-on-this-hill/die-on-this-hill-raw.mp3'),
                },
                {
                    id: 'vocal',
                    label: t('vocalButton'),
                    src: resolveMediaUrl('/audio/die-on-this-hill/die-on-this-hill-vocal.mp3'),
                },
                {
                    id: 'master',
                    label: t('masterButton'),
                    src: resolveMediaUrl('/audio/die-on-this-hill/die-on-this-hill-master.mp3'),
                },
            ],
        },
        {
            key: 'close-to-you',
            trackTitle: t('trackTitleCloseToYou'),
            tracks: [
                {
                    id: 'raw',
                    label: t('rawButton'),
                    src: resolveMediaUrl('/audio/close-to-you/close-to-you-raw.mp3'),
                },
                {
                    id: 'vocal',
                    label: t('vocalButton'),
                    src: resolveMediaUrl('/audio/close-to-you/close-to-you-vocal.mp3'),
                },
                {
                    id: 'master',
                    label: t('masterButton'),
                    src: resolveMediaUrl('/audio/close-to-you/close-to-you-master.mp3'),
                },
            ],
        },
    ];

    return (
        <section className="py-32 px-6 bg-off-white dark:bg-soft-brown">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-brick-red dark:text-warm-gold text-xs font-black uppercase tracking-[0.4em] mb-4 italic">
                        {t('label')}
                    </h2>
                    <h3 className="text-4xl font-extrabold text-dark-umber dark:text-off-white tracking-tighter italic">
                        {t('heading')}
                    </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {comparisonItems.map((item) => (
                        <AudioToggle
                            key={item.key}
                            trackTitle={item.trackTitle}
                            playButton={t('playButton')}
                            pauseButton={t('pauseButton')}
                            tracks={item.tracks}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
