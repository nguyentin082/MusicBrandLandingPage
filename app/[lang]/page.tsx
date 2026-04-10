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
import { StudioSection } from '@/components/sections/studio';
import { GearSection } from '@/components/sections/gear';
import { TeamSection } from '@/components/sections/team';
import { PricingSection } from '@/components/sections/pricing';
import { CTASection } from '@/components/sections/cta';
import { FAQSection } from '@/components/sections/faq';
import { siteConfig } from '@/lib/site';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    setRequestLocale(lang);
    const t = await getTranslations({ locale: lang, namespace: 'metadata' });

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': `${siteConfig.url}/#organization`,
                name: siteConfig.name,
                url: siteConfig.url,
                email: siteConfig.email,
                telephone: siteConfig.phone,
                sameAs: [
                    siteConfig.socials.facebook,
                    siteConfig.socials.instagram,
                    siteConfig.socials.telegram,
                    siteConfig.socials.zalo,
                ],
            },
            {
                '@type': 'MusicRecordingStudio',
                '@id': `${siteConfig.url}/${lang}#studio`,
                name: siteConfig.name,
                url: `${siteConfig.url}/${lang}`,
                description: t('description'),
                telephone: siteConfig.phone,
                email: siteConfig.email,
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: siteConfig.address,
                    addressCountry: 'VN',
                },
                areaServed: 'Vietnam',
            },
        ],
    };

    return (
        <div className="min-h-screen bg-off-white dark:bg-dark-umber text-dark-umber dark:text-off-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <Header />

            <main className="pt-24">
                <HeroSection />
                <PhilosophySection />
                <StatsSection />
                <ServicesSection />
                <PartnersSection />
                <AudioComparisonSection />
                <PortfolioSection />
                <StudioSection />
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
