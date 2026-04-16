import { getTranslations } from 'next-intl/server';

import { HeroCarousel } from './hero-carousel';

export async function HeroSection() {
    const t = await getTranslations('hero');

    return (
        <section className="relative min-h-screen flex items-center bg-dark-umber dark:bg-dark-umber text-off-white dark:text-off-white overflow-hidden py-16 sm:py-24 md:py-32">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-150 h-150 bg-brick-red rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-100 h-100 bg-warm-gold rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 items-center gap-8 sm:gap-12 md:gap-16 relative z-10">
                <div className="animate-fade-in">
                    <div className="block w-full px-4 py-1 rounded-full border border-warm-gold/30 text-warm-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6">
                        {t('badge')}
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-6 sm:mb-8 leading-[0.9] tracking-tighter italic">
                        {t('heading')} <br />
                        <span className="text-warm-gold">{t('highlighted')}</span>
                    </h1>
                    <p className="text-off-white/50 text-sm sm:text-base md:text-lg max-w-lg mb-8 sm:mb-12 font-light leading-relaxed italic">
                        {t('description')}
                    </p>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                        <a
                            href="#contact"
                            className="bg-brick-red px-6 sm:px-10 py-3 sm:py-5 rounded-2xl text-sm sm:text-base text-off-white font-bold hover:bg-brick-red/90 transition shadow-xl"
                        >
                            {t('cta_primary')}
                        </a>
                        <a
                            href="#portfolio"
                            className="px-6 sm:px-10 py-3 sm:py-5 border border-off-white/20 rounded-2xl text-sm sm:text-base font-bold hover:bg-off-white/5 transition"
                        >
                            {t('cta_secondary')}
                        </a>
                    </div>
                </div>

                <HeroCarousel />
            </div>
        </section>
    );
}
