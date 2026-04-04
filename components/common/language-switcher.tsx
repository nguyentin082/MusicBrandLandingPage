'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CountryFlag from 'react-country-flag';

export function LanguageSwitcher() {
    const pathname = usePathname();

    const getLocalizedPath = (locale: string) => {
        const segments = pathname.split('/');
        if (segments[1] === 'en' || segments[1] === 'vi') {
            segments[1] = locale;
        } else {
            segments.splice(1, 0, locale);
        }
        return segments.join('/');
    };

    const currentLang = pathname.split('/')[1] === 'vi' ? 'vi' : 'en';
    const nextLang = currentLang === 'en' ? 'vi' : 'en';
    const currentLocaleLabel = currentLang === 'en' ? 'English' : 'Tiếng Việt';
    const nextLocaleLabel = nextLang === 'en' ? 'English' : 'Tiếng Việt';

    return (
        <Link
            href={getLocalizedPath(nextLang)}
            aria-label={`Chuyển sang ${nextLocaleLabel}`}
            className="group inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick-red focus-visible:ring-offset-2 focus-visible:ring-offset-off-white dark:focus-visible:ring-offset-dark-umber"
        >
            <span className="relative grid h-10 w-36 grid-cols-2 overflow-hidden rounded-full border border-dark-umber/10 bg-white/80 shadow-sm transition hover:shadow-md dark:border-off-white/10 dark:bg-white/5">
                <span
                    className={`absolute inset-0.5 w-[calc(50%-0.125rem)] rounded-full bg-brick-red shadow-lg shadow-brick-red/20 transition-transform duration-300 ease-out ${
                        currentLang === 'vi' ? 'translate-x-full' : 'translate-x-0'
                    }`}
                />

                <span
                    className={`relative z-10 flex h-full items-center justify-center gap-1.5 text-[10px] font-bold uppercase leading-none tracking-[0.22em] transition-colors ${
                        currentLang === 'en'
                            ? 'text-off-white'
                            : 'text-dark-umber dark:text-off-white/80'
                    }`}
                >
                    <CountryFlag
                        countryCode="GB"
                        svg
                        style={{ width: '1.1em', height: '1.1em' }}
                        aria-label="Cờ nước Anh"
                    />
                    <span>EN</span>
                </span>

                <span
                    className={`relative z-10 flex h-full items-center justify-center gap-1.5 text-[10px] font-bold uppercase leading-none tracking-[0.22em] transition-colors ${
                        currentLang === 'vi'
                            ? 'text-off-white'
                            : 'text-dark-umber dark:text-off-white/80'
                    }`}
                >
                    <CountryFlag
                        countryCode="VN"
                        svg
                        style={{ width: '1.1em', height: '1.1em' }}
                        aria-label="Cờ Việt Nam"
                    />
                    <span>VI</span>
                </span>
            </span>
            <span className="sr-only">
                Đang dùng {currentLocaleLabel}. Bấm để chuyển sang {nextLocaleLabel}.
            </span>
        </Link>
    );
}
