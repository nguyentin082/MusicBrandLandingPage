import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HeroSection } from '@/components/sections/hero/page';
import { PhilosophySection } from '@/components/sections/philosophy/page';
import { StatsSection } from '@/components/sections/stats/page';
import { ServicesSection } from '@/components/sections/services/page';
import { PartnersSection } from '@/components/sections/partners/page';
import { AudioComparisonSection } from '@/components/sections/audio-comparison/page';
import { PortfolioSection } from '@/components/sections/portfolio/page';
import { SheetSection } from '@/components/sections/sheet/page';
import { GearSection } from '@/components/sections/gear/page';
import { TeamSection } from '@/components/sections/team/page';
import { PricingSection } from '@/components/sections/pricing/page';
import { CTASection } from '@/components/sections/cta/page';
import { FAQSection } from '@/components/sections/faq/page';
import { siteConfig } from '@/lib/site';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    setRequestLocale(lang);
    const t = await getTranslations({ locale: lang, namespace: 'metadata' });

    const tServices = await getTranslations({ locale: lang, namespace: 'services' });
    const tFaq = await getTranslations({ locale: lang, namespace: 'faq' });
    const tPricing = await getTranslations({ locale: lang, namespace: 'pricing' });

    const faqQuestions = tFaq.raw('questions') as Array<{ question: string; answer: string }>;
    const pricingPlans = tPricing.raw('plans') as Array<{ title: string; subtitle: string; price: string; features: string[]; cta: string }>;

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            // ── WebSite ─────────────────────────────────────────────────────────
            {
                '@type': 'WebSite',
                '@id': `${siteConfig.url}/#website`,
                url: siteConfig.url,
                name: siteConfig.name,
                potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                        '@type': 'EntryPoint',
                        urlTemplate: `${siteConfig.url}/${lang}?q={search_term_string}`,
                    },
                    'query-input': 'required name=search_term_string',
                },
            },
            // ── Organization ────────────────────────────────────────────────────
            {
                '@type': 'Organization',
                '@id': `${siteConfig.url}/#organization`,
                name: siteConfig.name,
                url: siteConfig.url,
                logo: {
                    '@type': 'ImageObject',
                    url: `${siteConfig.url}/icon-512.png`,
                },
                email: siteConfig.email,
                telephone: siteConfig.phone,
                sameAs: [
                    siteConfig.socials.facebook,
                    siteConfig.socials.instagram,
                    siteConfig.socials.tiktok,
                    siteConfig.socials.youtube,
                    siteConfig.socials.telegram,
                    siteConfig.socials.zalo,
                ],
            },
            // ── LocalBusiness / MusicRecordingStudio ────────────────────────────
            {
                '@type': ['MusicRecordingStudio', 'LocalBusiness'],
                '@id': `${siteConfig.url}/${lang}#studio`,
                name: siteConfig.name,
                url: `${siteConfig.url}/${lang}`,
                description: t('description'),
                telephone: siteConfig.phone,
                email: siteConfig.email,
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: siteConfig.address,
                    addressLocality: siteConfig.addressLocality,
                    addressRegion: siteConfig.addressRegion,
                    postalCode: siteConfig.postalCode,
                    addressCountry: siteConfig.addressCountry,
                },
                geo: {
                    '@type': 'GeoCoordinates',
                    latitude: siteConfig.geo.latitude,
                    longitude: siteConfig.geo.longitude,
                },
                openingHoursSpecification: [
                    {
                        '@type': 'OpeningHoursSpecification',
                        dayOfWeek: [
                            'Monday', 'Tuesday', 'Wednesday', 'Thursday',
                            'Friday', 'Saturday', 'Sunday',
                        ],
                        opens: '00:00',
                        closes: '23:59',
                    },
                ],
                priceRange: '$$',
                areaServed: [
                    { '@type': 'Country', name: 'Vietnam' },
                    { '@type': 'City', name: 'Ho Chi Minh City' },
                ],
                hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: lang === 'vi' ? 'Dịch vụ âm nhạc chuyên nghiệp' : 'Professional Music Services',
                    itemListElement: pricingPlans.map((plan, idx) => ({
                        '@type': 'Offer',
                        position: idx + 1,
                        name: plan.title,
                        description: [plan.subtitle, ...(plan.features ?? [])].join('. '),
                        url: `${siteConfig.url}/${lang}#pricing`,
                        seller: { '@id': `${siteConfig.url}/#organization` },
                    })),
                },
                image: `${siteConfig.url}/og-dark-square.png`,
                parentOrganization: { '@id': `${siteConfig.url}/#organization` },
            },
            // ── Services ────────────────────────────────────────────────────────
            {
                '@type': 'Service',
                '@id': `${siteConfig.url}/${lang}#service-recording`,
                name: tServices('recording.title'),
                description: tServices('recording.description'),
                provider: { '@id': `${siteConfig.url}/#organization` },
                areaServed: 'Vietnam',
                url: `${siteConfig.url}/${lang}#services`,
            },
            {
                '@type': 'Service',
                '@id': `${siteConfig.url}/${lang}#service-production`,
                name: tServices('production.title'),
                description: tServices('production.description'),
                provider: { '@id': `${siteConfig.url}/#organization` },
                areaServed: 'Vietnam',
                url: `${siteConfig.url}/${lang}#services`,
            },
            {
                '@type': 'Service',
                '@id': `${siteConfig.url}/${lang}#service-mixing`,
                name: tServices('mixing.title'),
                description: tServices('mixing.description'),
                provider: { '@id': `${siteConfig.url}/#organization` },
                areaServed: 'Vietnam',
                url: `${siteConfig.url}/${lang}#services`,
            },
            {
                '@type': 'Service',
                '@id': `${siteConfig.url}/${lang}#service-sheet`,
                name: tServices('sheetMusic.title'),
                description: tServices('sheetMusic.description'),
                provider: { '@id': `${siteConfig.url}/#organization` },
                areaServed: 'Vietnam',
                url: `${siteConfig.url}/${lang}#services`,
            },
            // ── FAQPage ─────────────────────────────────────────────────────────
            {
                '@type': 'FAQPage',
                '@id': `${siteConfig.url}/${lang}#faq`,
                mainEntity: faqQuestions.map((item) => ({
                    '@type': 'Question',
                    name: item.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: item.answer,
                    },
                })),
            },
        ],
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-off-white dark:bg-dark-umber text-dark-umber dark:text-off-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <Header />

            <main className="pt-10 sm:pt-0">
                <HeroSection />
                <PhilosophySection />
                <StatsSection />
                <ServicesSection />
                <PartnersSection />
                <SheetSection />
                <AudioComparisonSection />
                <PortfolioSection />
                <GearSection />
                <TeamSection />
                <PricingSection />
                <CTASection />
                <FAQSection />
            </main>

            <Footer />
        </div>
    );
}
