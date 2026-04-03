'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';

export function Header() {
  const t = useTranslations('navigation');

  return (
    <header className="fixed w-full z-[100] transition-all duration-500 py-6 bg-off-white dark:bg-dark-umber">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="w-10 h-10 bg-brick-red flex items-center justify-center rounded-lg shadow-lg">
            <span className="text-off-white font-black text-lg italic">W</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tighter text-dark-umber dark:text-off-white">
              {t('logo')}
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-warm-gold font-bold">
              {t('tagline')}
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-dark-umber dark:text-off-white">
          <a
            href="#services"
            className="hover:text-warm-gold transition"
          >
            {t('services')}
          </a>
          <a
            href="#portfolio"
            className="hover:text-warm-gold transition"
          >
            {t('portfolio')}
          </a>
          <a
            href="#gear"
            className="hover:text-warm-gold transition"
          >
            {t('gear')}
          </a>
          <a
            href="#pricing"
            className="hover:text-warm-gold transition"
          >
            {t('pricing')}
          </a>
          <a
            href="#contact"
            className="bg-brick-red text-off-white px-6 py-3 rounded-full hover:scale-105 transition shadow-lg shadow-brick-red/20"
          >
            {t('contact')}
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
