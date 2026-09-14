import {
    SiApplemusic,
    SiFacebook,
    SiInstagram,
    SiSnapchat,
    SiSpotify,
    SiTiktok,
    SiYoutubemusic,
} from 'react-icons/si';
import { FaAmazon, FaDeezer, FaFacebookF } from 'react-icons/fa6';

/**
 * Explicit icon registry.
 *
 * This file must never use `import * as Icons from 'react-icons/si'`: a
 * namespace import defeats tree shaking and ships the entire Simple Icons and
 * Font Awesome sets (~2 MB of JavaScript, of which the page uses under 1%).
 * Add a named import above when a new platform is introduced.
 */
export const PLATFORM_ICONS = {
    SiSpotify,
    SiApplemusic,
    SiYoutubemusic,
    SiTiktok,
    SiInstagram,
    SiFacebook,
    SiSnapchat,
    FaAmazon,
    FaDeezer,
} as const;

export type PlatformIconName = keyof typeof PLATFORM_ICONS;

export function getPlatformIcon(name: string): React.ElementType | undefined {
    return PLATFORM_ICONS[name as PlatformIconName];
}

export { FaFacebookF };
