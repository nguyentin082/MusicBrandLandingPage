const contactPhone = '+84837216129';

export const contactInfo = {
    phone: contactPhone,
    email: 'hello@wavvietnam.studio',
    links: {
        call: `tel:${contactPhone}`,
        sms: `sms:${contactPhone}`,
        zalo: `https://zalo.me/${contactPhone.replace('+', '')}`,
        facebook: 'https://www.facebook.com/trungtin.h.nguyen.908',
        instagram: 'https://www.instagram.com/trungtin.h.nguyen.908',
        telegram: 'https://t.me/nguyenhoangtrungtin',
    },
} as const;
