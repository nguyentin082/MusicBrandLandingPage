import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';
import { MobileNav } from './mobile-nav';

export async function Header() {
    const t = await getTranslations('navigation');

    return (
        <header
            className="fixed top-0 left-0 right-0 z-40 transition-all duration-500 py-4 sm:py-6 bg-off-white dark:bg-dark-umber border-b border-gray-200 dark:border-gray-800"
            style={{
                paddingTop: 'max(1rem, env(safe-area-inset-top))',
                paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
                paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
            }}
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
                {/* Logo - Responsive sizing */}
                <Link
                    href="/"
                    className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition shrink-0"
                >
                    <Image
                        src="/icon-light.svg"
                        alt=""
                        width={120}
                        height={80}
                        priority
                        className="h-9 sm:h-10 w-auto drop-shadow-sm dark:hidden"
                    />
                    <Image
                        src="/icon.svg"
                        alt=""
                        width={120}
                        height={80}
                        priority
                        className="hidden h-9 sm:h-10 w-auto drop-shadow-sm dark:block"
                    />
                    <div className="hidden flex-col gap-0.5 sm:flex">
                        <span className="text-base sm:text-lg font-bold tracking-tighter text-dark-umber dark:text-off-white">
                            {t('logo')}
                        </span>
                        <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.3em] text-dark-umber dark:text-off-white font-bold">
                            {t('tagline')}
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation - Hidden on mobile */}
                <nav
                    className="hidden lg:flex items-center gap-6 xl:gap-8 text-[11px] font-bold uppercase tracking-widest text-dark-umber dark:text-off-white flex-1 justify-center"
                    role="navigation"
                    aria-label="Main navigation"
                >
                    <a
                        href="#services"
                        className="hover:text-warm-gold transition focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-2"
                    >
                        {t('services')}
                    </a>
                    <a
                        href="#portfolio"
                        className="hover:text-warm-gold transition focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-2"
                    >
                        {t('portfolio')}
                    </a>
                    <a
                        href="#gear"
                        className="hover:text-warm-gold transition focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-2"
                    >
                        {t('gear')}
                    </a>
                    <a
                        href="#pricing"
                        className="hover:text-warm-gold transition focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-2"
                    >
                        {t('pricing')}
                    </a>
                    <a
                        href="#contact"
                        className="bg-brick-red text-off-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full hover:scale-105 transition shadow-lg shadow-brick-red/20 focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                        {t('contact')}
                    </a>
                </nav>

                {/* Right side - Theme & Language toggles + Mobile Menu */}
                <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0 shrink-0">
                    <ThemeToggle />
                    <LanguageSwitcher />
                    <MobileNav />
                </div>
            </div>
        </header>
    );
}
