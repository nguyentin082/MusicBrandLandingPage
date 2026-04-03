import { getTranslations } from 'next-intl/server';
import { AudioToggle } from './audio-toggle';

export async function AudioComparisonSection() {
    const t = await getTranslations('audioComparison');

    return (
        <section className="py-32 px-6 bg-off-white dark:bg-soft-brown">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-brick-red dark:text-warm-gold text-xs font-black uppercase tracking-[0.4em] mb-4 italic">
                        {t('label')}
                    </h2>
                    <h3 className="text-4xl font-extrabold text-dark-umber dark:text-off-white tracking-tighter italic">
                        {t('heading')}
                    </h3>
                </div>

                <AudioToggle
                    trackTitle={t('trackTitle')}
                    rawButton={t('rawButton')}
                    masterButton={t('masterButton')}
                />
            </div>
        </section>
    );
}
