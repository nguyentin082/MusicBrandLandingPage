import * as Fa6Icons from 'react-icons/fa6';

interface CustomPlatformIconProps {
    iconName: string;
    label: string;
    IconComponent?: React.ElementType;
    size?: number;
}

export function CustomPlatformIcon({
    iconName,
    label,
    IconComponent,
    size = 40,
}: CustomPlatformIconProps) {
    if (!IconComponent) {
        return null;
    }

    const scaleFactor = size / 40;

    if (iconName === 'SiInstagram') {
        return (
            <div
                className="relative flex items-center justify-center rounded-[11px] bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)] shadow-[0_0_18px_rgba(214,36,159,0.35)]"
                style={{ width: size, height: size }}
            >
                <IconComponent
                    size={Math.round(24 * scaleFactor)}
                    style={{ color: '#FFFFFF' }}
                    className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
                    aria-label={label}
                />
                <span
                    className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-white/95"
                    aria-hidden="true"
                />
            </div>
        );
    }

    if (iconName === 'SiTiktok') {
        return (
            <div style={{ width: size, height: size }} className="relative">
                <IconComponent
                    size={Math.round(36 * scaleFactor)}
                    style={{ color: '#25F4EE' }}
                    className="absolute left-0.5 top-px"
                    aria-hidden="true"
                />
                <IconComponent
                    size={Math.round(36 * scaleFactor)}
                    style={{ color: '#FE2C55' }}
                    className="absolute -left-0.5 -top-px"
                    aria-hidden="true"
                />
                <IconComponent
                    size={Math.round(36 * scaleFactor)}
                    style={{ color: '#FFFFFF' }}
                    className="absolute left-0 top-0"
                    aria-label={label}
                />
            </div>
        );
    }

    if (iconName === 'SiFacebook') {
        return (
            <div
                className="flex items-center justify-center rounded-full bg-[#1877F2] shadow-[0_0_14px_rgba(24,119,242,0.35)]"
                style={{ width: size, height: size }}
            >
                <Fa6Icons.FaFacebookF
                    size={Math.round(22 * scaleFactor)}
                    style={{ color: '#FFFFFF' }}
                    aria-label={label}
                />
            </div>
        );
    }

    if (iconName === 'FaDeezer') {
        return (
            <div
                className="flex items-end justify-center gap-0.5 rounded-md bg-[#111111] p-1.5"
                style={{ width: size, height: size }}
                aria-label={label}
            >
                <span
                    className="rounded-sm bg-[#8E3CF7]"
                    style={{ width: Math.round(4 * scaleFactor), height: '28%' }}
                    aria-hidden="true"
                />
                <span
                    className="rounded-sm bg-[#F43B86]"
                    style={{ width: Math.round(4 * scaleFactor), height: '45%' }}
                    aria-hidden="true"
                />
                <span
                    className="rounded-sm bg-[#FF6B2D]"
                    style={{ width: Math.round(4 * scaleFactor), height: '62%' }}
                    aria-hidden="true"
                />
                <span
                    className="rounded-sm bg-[#FFC73A]"
                    style={{ width: Math.round(4 * scaleFactor), height: '78%' }}
                    aria-hidden="true"
                />
                <span
                    className="rounded-sm bg-[#16D16D]"
                    style={{ width: Math.round(4 * scaleFactor), height: '92%' }}
                    aria-hidden="true"
                />
            </div>
        );
    }

    return null;
}
