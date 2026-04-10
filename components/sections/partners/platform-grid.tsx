'use client';

import * as SiIcons from 'react-icons/si';
import * as Fa6Icons from 'react-icons/fa6';
import { CustomPlatformIcon } from './custom-platform-icon';

interface Platform {
    name: string;
    icon: string;
}

interface PlatformGridProps {
    platforms: Platform[];
}

export function PlatformGrid({ platforms }: PlatformGridProps) {
    const platformsForScroll = [...platforms, ...platforms];

    return (
        <div className="relative w-full overflow-hidden">
            <style>{`
                @keyframes scroll-left {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .platform-scroll {
                    animation: scroll-left 30s linear infinite;
                }
                .platform-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
            <div className="platform-scroll flex gap-6 md:gap-8 w-fit">
                {platformsForScroll.map((platform, idx) => (
                    <PlatformItem key={idx} platform={platform} />
                ))}
            </div>
        </div>
    );
}

interface PlatformItemProps {
    platform: Platform;
}

const BRAND_ICON_COLORS: Record<string, string> = {
    SiSpotify: '#1DB954',
    SiApplemusic: '#FC3C44',
    FaAmazon: '#FF9900',
    SiYoutubemusic: '#FF0000',
    FaDeezer: '#A238FF',
    SiTiktok: '#FE2C55',
    SiInstagram: '#E4405F',
    SiFacebook: '#1877F2',
    SiSnapchat: '#FFFC00',
};

function PlatformItem({ platform }: PlatformItemProps) {
    const IconComponent = platform.icon.startsWith('Fa')
        ? (Fa6Icons[platform.icon as keyof typeof Fa6Icons] as React.ElementType | undefined)
        : (SiIcons[platform.icon as keyof typeof SiIcons] as React.ElementType | undefined);
    const iconColor = BRAND_ICON_COLORS[platform.icon] ?? '#F5F5F5';

    const hasCustomIcon = ['SiInstagram', 'SiTiktok', 'SiFacebook', 'FaDeezer'].includes(
        platform.icon,
    );

    return (
        <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg opacity-60 hover:opacity-100 transition duration-300 hover:bg-warm-gold/5 min-w-fit">
            {IconComponent ? (
                hasCustomIcon ? (
                    <CustomPlatformIcon
                        iconName={platform.icon}
                        label={platform.name}
                        IconComponent={IconComponent}
                        size={80}
                    />
                ) : (
                    <IconComponent
                        size={80}
                        style={{ color: iconColor }}
                        aria-label={platform.name}
                    />
                )
            ) : (
                <div className="w-9 h-9 bg-off-white/20 rounded" />
            )}
            <span className="text-xs font-medium text-off-white dark:text-off-white text-center leading-tight line-clamp-2">
                {platform.name}
            </span>
        </div>
    );
}
