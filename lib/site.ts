import { contactInfo } from '@/lib/contact';

export const siteConfig = {
    name: '2lab',
    description:
        'Professional recording studio in Vietnam. Expert mix & master services with analog gear. Trusted by 150+ indie artists.',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://2lab.vn',
    phone: contactInfo.phone,
    email: contactInfo.email,
    address: 'District 1, Ho Chi Minh City, Vietnam',
    socials: {
        facebook: contactInfo.links.facebook,
        instagram: contactInfo.links.instagram,
        tiktok: contactInfo.links.tiktok,
        youtube: contactInfo.links.youtube,
        telegram: contactInfo.links.telegram,
        zalo: contactInfo.links.zalo,
    },
} as const;
