import { getTranslations } from 'next-intl/server';
import { AudioToggle } from '../audio-toggle';
import { AudioTrack } from './types';

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
                    src: '/audio/die-on-this-hill/DieOnThisHillRawVocalWithBeat.wav',
                },
                {
                    id: 'vocal',
                    label: t('vocalButton'),
                    src: '/audio/die-on-this-hill/DieOnThisHillOnlyVocal.wav',
                },
                {
                    id: 'master',
                    label: t('masterButton'),
                    src: '/audio/die-on-this-hill/DieOnThisHillMastered2ndFixed.wav',
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
                    src: '/audio/close-to-you/CloseToYouRawVocalWithBeat.wav',
                },
                {
                    id: 'vocal',
                    label: t('vocalButton'),
                    src: '/audio/close-to-you/CloseToYouOnlyVocal.wav',
                },
                {
                    id: 'master',
                    label: t('masterButton'),
                    src: '/audio/close-to-you/CloseToYouMastered1stFixed.wav',
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

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">
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
