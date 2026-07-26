import { contactInfo } from '@/lib/contact';

export const siteConfig = {
    name: '2LAB',
    description:
        'Phòng thu âm, sản xuất âm nhạc chuyên nghiệp tại Việt Nam. Dịch vụ Mix & Master cao cấp. Được tin tưởng bởi nhiều nghệ sĩ hàng đầu Việt Nam.',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://2lab.vn',
    phone: contactInfo.phone,
    email: contactInfo.email,
    address: 'Ho Chi Minh City, Vietnam',
    socials: {
        facebook: contactInfo.links.facebook,
        instagram: contactInfo.links.instagram,
        tiktok: contactInfo.links.tiktok,
        youtube: contactInfo.links.youtube,
        telegram: contactInfo.links.telegram,
        zalo: contactInfo.links.zalo,
    },
} as const;
