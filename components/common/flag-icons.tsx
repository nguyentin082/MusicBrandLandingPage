/**
 * Inline flag marks for the language switcher.
 *
 * These replace `react-country-flag`, which rendered <img> tags pointing at
 * cdn.jsdelivr.net. That cost two extra DNS + TLS handshakes to a third-party
 * origin for 1.7 KB of SVG, and the files came back with only a 7 day cache.
 * Inlining removes the last third-party request on the page and makes the flags
 * paint with the rest of the header instead of popping in afterwards.
 *
 * Both are decorative: the switcher button carries its own accessible name.
 */

type FlagProps = {
    className?: string;
};

export function FlagGB({ className }: FlagProps) {
    return (
        <svg
            viewBox="0 0 640 480"
            className={className}
            role="presentation"
            aria-hidden="true"
            focusable="false"
        >
            <path fill="#012169" d="M0 0h640v480H0z" />
            <path
                fill="#FFF"
                d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"
            />
            <path
                fill="#C8102E"
                d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"
            />
            <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
            <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
        </svg>
    );
}

export function FlagVN({ className }: FlagProps) {
    return (
        <svg
            viewBox="0 0 640 480"
            className={className}
            role="presentation"
            aria-hidden="true"
            focusable="false"
        >
            <path fill="#da251d" d="M0 0h640v480H0z" />
            <path
                fill="#ff0"
                d="M320 120 346.9 202.9 434.1 202.9 363.6 254.2 390.5 337.1 320 285.8 249.5 337.1 276.4 254.2 205.9 202.9 293.1 202.9Z"
            />
        </svg>
    );
}
