import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, Check, Sparkles } from 'lucide-react';

export async function PricingSection() {
    const t = await getTranslations('pricing');

    const plans = t.raw('plans') as any[];

    return (
        <section
            id="pricing"
            className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-off-white dark:bg-dark-umber"
        >
            <div className="max-w-7xl mx-auto">
                <h3 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-dark-umber dark:text-off-white tracking-tighter mb-12 sm:mb-16 md:mb-20 italic">
                    {t('heading')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    {plans.map((plan, idx) => {
                        const isBestSeller =
                            typeof plan.badge === 'string' &&
                            plan.badge.toLowerCase().includes('best seller');

                        return (
                            <div
                                key={idx}
                                className={`group relative rounded-[48px] border flex flex-col transition duration-500 hover:-translate-y-1 ${
                                    idx === 1
                                        ? 'bg-brick-red text-off-white border-brick-red scale-105 shadow-2xl'
                                        : 'bg-white dark:bg-soft-brown text-dark-umber dark:text-off-white border-dark-umber/5 dark:border-off-white/10 hover:border-warm-gold/50'
                                } ${isBestSeller ? 'overflow-visible ring-2 ring-warm-gold/70 shadow-[0_20px_60px_-25px_rgba(196,141,48,0.75)]' : ''} ${
                                    isBestSeller && idx !== 1
                                        ? 'border-warm-gold/60 bg-linear-to-b from-warm-gold/15 via-white to-white dark:from-warm-gold/20 dark:via-soft-brown dark:to-soft-brown'
                                        : ''
                                } p-10`}
                            >
                                {plan.badge && (
                                    <span
                                        className={`absolute top-0 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 rounded-full px-4 py-1.5 text-[10px] font-black uppercase italic whitespace-nowrap ${
                                            isBestSeller
                                                ? 'bg-warm-gold text-dark-umber border border-warm-gold/80 shadow-lg shadow-warm-gold/30'
                                                : 'bg-warm-gold text-dark-umber'
                                        }`}
                                    >
                                        {isBestSeller && (
                                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                                        )}
                                        {plan.badge}
                                    </span>
                                )}
                                <div className="mb-2">
                                    <h4 className="text-lg sm:text-xl font-bold italic">
                                        {plan.title}
                                    </h4>
                                </div>
                                <p
                                    className={`text-[9px] sm:text-[10px] font-bold uppercase mb-6 sm:mb-8 ${
                                        idx === 1 ? 'text-warm-gold' : 'text-warm-gold'
                                    }`}
                                >
                                    {plan.subtitle}
                                </p>
                                <div className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 italic">
                                    {plan.price}
                                </div>
                                <ul
                                    className={`text-[11px] sm:text-xs space-y-3 sm:space-y-4 grow italic mb-8 sm:mb-10 ${
                                        idx === 1
                                            ? 'text-off-white/60'
                                            : 'text-soft-brown dark:text-off-white/70'
                                    }`}
                                >
                                    {(plan.features as string[]).map((feature, fidx) => (
                                        <li key={fidx} className="flex items-center gap-2">
                                            <Check
                                                className={`w-4 h-4 shrink-0 ${idx === 1 ? 'text-warm-gold' : 'text-warm-gold'}`}
                                            />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href="#contact"
                                    className={`w-full py-3 sm:py-4 rounded-2xl text-center text-sm sm:text-base font-bold transition hover:scale-105 inline-flex items-center justify-center gap-2 ${
                                        idx === 1
                                            ? 'bg-off-white text-dark-umber shadow-lg'
                                            : 'bg-dark-umber dark:bg-off-white text-off-white dark:text-dark-umber'
                                    }`}
                                >
                                    {plan.cta}
                                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                </a>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
