'use client';

import { useCallback, useEffect, useMemo, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CountryFlag from 'react-country-flag';

const SUPPORTED_LOCALES = ['en', 'vi'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_LABEL: Record<Locale, string> = {
    en: 'English',
    vi: 'Tiếng Việt',
};

function buildLocalizedPath(pathname: string, locale: Locale) {
    const segments = pathname.split('/');
    const firstSegment = segments[1] as string | undefined;

    if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment as Locale)) {
        segments[1] = locale;
    } else {
        segments.splice(1, 0, locale);
    }

    return segments.join('/');
}

export function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentLang = useMemo<Locale>(() => {
        const firstSegment = pathname.split('/')[1];
        return firstSegment === 'vi' ? 'vi' : 'en';
    }, [pathname]);

    const nextLang: Locale = currentLang === 'en' ? 'vi' : 'en';
    const currentLocaleLabel = LOCALE_LABEL[currentLang];
    const nextLocaleLabel = LOCALE_LABEL[nextLang];
    const nextPathname = useMemo(
        () => buildLocalizedPath(pathname, nextLang),
        [pathname, nextLang],
    );

    useEffect(() => {
        router.prefetch(nextPathname);
    }, [router, nextPathname]);

    const handleSwitchLanguage = useCallback(() => {
        if (isPending) return;

        const queryString = searchParams.toString();
        const hash = window.location.hash;
        const href = `${nextPathname}${queryString ? `?${queryString}` : ''}${hash}`;

        startTransition(() => {
            router.replace(href, { scroll: false });
        });
    }, [isPending, searchParams, nextPathname, startTransition, router]);

    return (
        <button
            type="button"
            onClick={handleSwitchLanguage}
            disabled={isPending}
            aria-label={`Chuyển sang ${nextLocaleLabel}`}
            aria-busy={isPending}
            className="group inline-flex cursor-pointer items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick-red focus-visible:ring-offset-2 focus-visible:ring-offset-off-white disabled:cursor-not-allowed disabled:opacity-80 dark:focus-visible:ring-offset-dark-umber"
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
        </button>
    );
}
