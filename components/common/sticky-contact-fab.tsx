import { Facebook, Instagram, MessageSquareText, PhoneCall, Send } from 'lucide-react';
import { SiZalo } from 'react-icons/si';

type ContactFabLabels = {
    call: string;
    sms: string;
    zalo: string;
    facebook: string;
    instagram: string;
    telegram: string;
};

const contactPhone = '+84837216129';
const contactLinks = {
    call: `tel:${contactPhone}`,
    sms: `sms:${contactPhone}`,
    zalo: `https://zalo.me/${contactPhone.replace('+', '')}`,
    facebook: 'https://www.facebook.com/trungtin.h.nguyen.908',
    instagram: 'https://www.instagram.com/trungtin.h.nguyen.908',
    telegram: 'https://t.me/nguyenhoangtrungtin',
} as const;

const contactActions = [
    {
        key: 'call',
        href: contactLinks.call,
        labelKey: 'call',
        icon: PhoneCall,
        external: false,
    },
    {
        key: 'sms',
        href: contactLinks.sms,
        labelKey: 'sms',
        icon: MessageSquareText,
        external: false,
    },
    {
        key: 'zalo',
        href: contactLinks.zalo,
        labelKey: 'zalo',
        icon: SiZalo,
        external: true,
    },
    {
        key: 'facebook',
        href: contactLinks.facebook,
        labelKey: 'facebook',
        icon: Facebook,
        external: true,
    },
    {
        key: 'instagram',
        href: contactLinks.instagram,
        labelKey: 'instagram',
        icon: Instagram,
        external: true,
    },
    {
        key: 'telegram',
        href: contactLinks.telegram,
        labelKey: 'telegram',
        icon: Send,
        external: true,
    },
] as const;

export function StickyContactFab({ labels }: { labels: ContactFabLabels }) {
    return (
        <div className="fixed bottom-5 right-5 z-50 pointer-events-none sm:bottom-6 sm:right-6">
            <div className="pointer-events-auto flex flex-col gap-2 rounded-[999px] border border-white/25 bg-white/75 p-3 shadow-[0_20px_60px_rgba(26,22,20,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-dark-umber/70 dark:shadow-[0_20px_60px_rgba(26,22,20,0.45)]">
                {contactActions.map(({ key, href, labelKey, icon: Icon, external }) => (
                    <a
                        key={key}
                        href={href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noreferrer' : undefined}
                        aria-label={labels[labelKey]}
                        title={labels[labelKey]}
                        className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-dark-umber/10 bg-off-white text-dark-umber transition-all duration-300 hover:-translate-y-0.5 hover:bg-warm-gold hover:text-dark-umber hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80 dark:border-off-white/10 dark:bg-off-white/10 dark:text-off-white dark:hover:bg-warm-gold dark:hover:text-dark-umber"
                    >
                        <Icon className="size-5" />
                        <span className="pointer-events-none absolute right-13 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-dark-umber/10 bg-off-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-dark-umber opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 dark:border-off-white/10 dark:bg-dark-umber dark:text-off-white sm:block">
                            {labels[labelKey]}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
}
