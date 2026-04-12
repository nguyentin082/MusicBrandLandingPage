const contactPhone = '+84837216129';

export const contactInfo = {
    phone: contactPhone,
    email: 'hello@wavvietnam.studio',
    map: {
        title: 'The Useful Apartment',
        address: '654/6 Lạc Long Quân, Phường 9, Tân Hòa, Hồ Chí Minh, Việt Nam',
        url: 'https://www.google.com/maps/place/The+Useful+Apartment/@10.7750086,106.6492008,17z/data=!3m1!4b1!4m6!3m5!1s0x31752f5d546fddc9:0xb058d179a080b6d4!8m2!3d10.7750086!4d106.6492008!16s%2Fg%2F11l59jm5w1?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D',
        embedUrl: 'https://www.google.com/maps?q=10.7750086,106.6492008&z=17&output=embed',
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=10.7750086,106.6492008',
    },
    links: {
        call: `tel:${contactPhone}`,
        sms: `sms:${contactPhone}`,
        zalo: `https://zalo.me/${contactPhone.replace('+', '')}`,
        facebook: 'https://www.facebook.com/trungtin.h.nguyen.908',
        instagram: 'https://www.instagram.com/trungtin.h.nguyen.908',
        telegram: 'https://t.me/nguyenhoangtrungtin',
    },
} as const;
