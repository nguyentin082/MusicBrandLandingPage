import { Header } from '@/components/common/header';
import { Footer } from '@/components/common/footer';
import { setRequestLocale } from 'next-intl/server';
import { HeroSection } from '@/components/sections/hero';
import { PhilosophySection } from '@/components/sections/philosophy';
import { StatsSection } from '@/components/sections/stats';
import { ServicesSection } from '@/components/sections/services';
import { PartnersSection } from '@/components/sections/partners';
import { AudioComparisonSection } from '@/components/sections/audio-comparison';
import { PortfolioSection } from '@/components/sections/portfolio';
import { StudioSection } from '@/components/sections/studio';
import { GearSection } from '@/components/sections/gear';
import { TeamSection } from '@/components/sections/team';
import { PricingSection } from '@/components/sections/pricing';
import { CTASection } from '@/components/sections/cta';
import { FAQSection } from '@/components/sections/faq';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    setRequestLocale(lang);

    return (
        <div className="min-h-screen bg-off-white dark:bg-dark-umber text-dark-umber dark:text-off-white">
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
