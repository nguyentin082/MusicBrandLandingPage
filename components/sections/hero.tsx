import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export async function HeroSection() {
    const t = await getTranslations('hero');

    return (
        <section className="relative min-h-screen flex items-center bg-dark-umber dark:bg-dark-umber text-off-white dark:text-off-white overflow-hidden pt-20">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-brick-red rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-warm-gold rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 items-center gap-16 relative z-10">
                <div className="animate-fade-in">
                    <div className="inline-block px-4 py-1 rounded-full border border-warm-gold/30 text-warm-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                        {t('badge')}
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter italic">
                        {t('heading')} <br />
                        <span className="text-warm-gold">
                            {t('highlighted')}
                        </span>
                    </h1>
                    <p className="text-off-white/50 text-lg md:text-xl max-w-lg mb-12 font-light leading-relaxed italic">
                        {t('description')}
                    </p>
                    <div className="flex flex-wrap gap-6">
                        <a
                            href="#contact"
                            className="bg-brick-red px-10 py-5 rounded-2xl text-off-white font-bold hover:bg-brick-red/90 transition shadow-xl"
                        >
                            {t('cta_primary')}
                        </a>
                        <a
                            href="#portfolio"
                            className="px-10 py-5 border border-off-white/20 rounded-2xl font-bold hover:bg-off-white/5 transition"
                        >
                            {t('cta_secondary')}
                        </a>
                    </div>
                </div>

                <div className="relative hidden lg:block animate-fade-in">
                    <div className="aspect-[4/5] rounded-[40px] overflow-hidden border-[12px] border-soft-brown shadow-2xl relative">
                        <Image
                            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800"
                            fill
                            sizes="(max-width: 1024px) 0vw, 40vw"
                            priority
                            className="object-cover grayscale opacity-80 hover:opacity-100 transition duration-700"
                            alt="Professional recording studio"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
