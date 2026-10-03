import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { resolveMediaUrl } from '@/lib/media';
import type { SiteLocale } from '@/lib/locale';

const logoDark = resolveMediaUrl('/image/branding/2lab-logo-dark-mode.PNG');

// A waveform that fades out into a flat line.
const WAVEFORM_BARS = Array.from({ length: 48 }, (_, index) => {
    const fade = Math.max(0, 1 - index / 30);
    const amplitude = 0.35 + 0.65 * Math.abs(Math.sin(index * 1.7) * Math.cos(index * 0.45));
    return Math.max(4, Math.round(56 * fade * amplitude));
});

export type NotFoundCopy = {
    badge: string;
    heading: string;
    highlighted: string;
    description: string;
    home: string;
    blog: string;
    contact: string;
    otherLanguage: string;
};

export async function getNotFoundCopy(locale: SiteLocale): Promise<NotFoundCopy> {
    const t = await getTranslations({ locale, namespace: 'notFound' });

    return {
        badge: t('badge'),
        heading: t('heading'),
        highlighted: t('highlighted'),
        description: t('description'),
        home: t('home'),
        blog: t('blog'),
        contact: t('contact'),
        otherLanguage: t('otherLanguage'),
    };
}

export function NotFoundContent({ locale, copy }: { locale: SiteLocale; copy: NotFoundCopy }) {
    const otherLocale: SiteLocale = locale === 'vi' ? 'en' : 'vi';

    return (
        <section className="relative isolate overflow-hidden rounded-[3rem] bg-dark-umber px-6 py-16 sm:px-16 sm:py-24 text-center shadow-2xl dark:bg-[#110e0c]">
            {/* Brand glows, matching the blog hero */}
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 mix-blend-color-dodge">
                <div className="absolute -top-[50%] -left-[10%] h-[150%] w-[70%] rotate-12 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brick-red/70 via-transparent to-transparent blur-3xl" />
                <div className="absolute -bottom-[20%] -right-[10%] h-[100%] w-[60%] -rotate-12 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-warm-gold/60 via-transparent to-transparent blur-3xl" />
            </div>

            {/* Oversized 404 behind the content */}
            <p
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none text-[11rem] font-black leading-none tracking-tighter text-off-white/[0.04] sm:text-[18rem] lg:text-[22rem]"
            >
                404
            </p>

            <div className="flex flex-col items-center">
                <Link
                    href={`/${locale}`}
                    className="mb-10 rounded-2xl transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold focus-visible:ring-offset-4 focus-visible:ring-offset-dark-umber"
                >
                    <Image
                        src={logoDark}
                        alt="2lab"
                        width={240}
                        height={90}
                        priority
                        sizes="(max-width: 640px) 160px, 200px"
                        className="h-16 w-auto rounded-xl object-contain drop-shadow-lg sm:h-20 sm:rounded-2xl"
                    />
                </Link>

                <span className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-warm-gold shadow-sm backdrop-blur-md">
                    {copy.badge}
                </span>

                <h1 className="max-w-3xl text-4xl font-black italic leading-[1.1] tracking-tighter text-off-white sm:text-6xl md:text-7xl">
                    {copy.heading} <br />
                    <span className="text-warm-gold">{copy.highlighted}</span>
                </h1>

                <div
                    aria-hidden="true"
                    className="mt-10 flex h-14 w-full max-w-md items-center justify-center gap-[3px]"
                >
                    {WAVEFORM_BARS.map((height, index) => (
                        <span
                            key={index}
                            className="w-[3px] shrink-0 rounded-full bg-gradient-to-t from-brick-red to-warm-gold"
                            style={{ height, opacity: height <= 4 ? 0.35 : 0.9 }}
                        />
                    ))}
                </div>

                <p className="mt-8 max-w-lg text-sm font-light leading-relaxed text-off-white/70 sm:text-base">
                    {copy.description}
                </p>

                <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
                    <Link
                        href={`/${locale}`}
                        className="inline-flex w-full items-center justify-center rounded-full bg-brick-red px-7 py-3 text-sm font-bold uppercase tracking-widest text-off-white shadow-lg shadow-brick-red/20 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-umber sm:w-auto"
                    >
                        {copy.home}
                    </Link>
                    <Link
                        href={`/${locale}/blog`}
                        className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-semibold text-off-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold sm:w-auto"
                    >
                        {copy.blog}
                    </Link>
                    <Link
                        href={`/${locale}#contact`}
                        className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-semibold text-off-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold sm:w-auto"
                    >
                        {copy.contact}
                    </Link>
                </div>

                <Link
                    href={`/${otherLocale}`}
                    hrefLang={otherLocale}
                    lang={otherLocale}
                    className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-off-white/60 underline-offset-4 transition hover:text-warm-gold hover:underline"
                >
                    {copy.otherLanguage}
                </Link>
            </div>
        </section>
    );
}
