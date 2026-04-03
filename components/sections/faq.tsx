import { getTranslations } from 'next-intl/server';
import { FAQAccordion } from './faq-accordion';

export async function FAQSection() {
  const t = await getTranslations('faq');

  const questions = t.raw('questions') as any[];

  return (
    <section className="py-32 px-6 bg-off-white dark:bg-soft-brown">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-black text-dark-umber dark:text-off-white mb-16 text-center tracking-tighter italic">
          {t('heading')}
        </h2>
        <FAQAccordion questions={questions} />
      </div>
    </section>
  );
}
