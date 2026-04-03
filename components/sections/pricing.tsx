import { getTranslations } from 'next-intl/server';
import { Check } from 'lucide-react';

export async function PricingSection() {
    const t = await getTranslations('pricing');

    const plans = t.raw('plans') as any[];

    return (
        <section id="pricing" className="py-32 px-6 bg-off-white dark:bg-dark-umber">
            <div className="max-w-7xl mx-auto">
                <h3 className="text-center text-4xl font-extrabold text-dark-umber dark:text-off-white tracking-tighter mb-20 italic">
                    {t('heading')}
                </h3>
                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`p-10 rounded-[48px] border flex flex-col transition duration-500 hover:-translate-y-1 ${
                                idx === 1
                                    ? 'bg-brick-red text-off-white border-brick-red scale-105 shadow-2xl relative'
                                    : 'bg-white dark:bg-soft-brown text-dark-umber dark:text-off-white border-dark-umber/5 dark:border-off-white/10 hover:border-warm-gold/50'
                            }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-warm-gold text-dark-umber text-[10px] font-black px-4 py-1 rounded-full uppercase italic">
                                    {plan.badge}
                                </div>
                            )}
                            <h4 className="text-xl font-bold italic mb-2">{plan.title}</h4>
                            <p
                                className={`text-[10px] font-bold uppercase mb-8 ${
                                    idx === 1 ? 'text-warm-gold' : 'text-warm-gold'
                                }`}
                            >
                                {plan.subtitle}
                            </p>
                            <div className="text-3xl font-black mb-8 italic">{plan.price}</div>
                            <ul
                                className={`text-xs space-y-4 grow italic mb-10 ${
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
                                className={`w-full py-4 rounded-2xl text-center font-bold transition hover:scale-105 ${
                                    idx === 1
                                        ? 'bg-off-white text-dark-umber shadow-lg'
                                        : 'bg-dark-umber dark:bg-off-white text-off-white dark:text-dark-umber'
                                }`}
                            >
                                {plan.cta}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
