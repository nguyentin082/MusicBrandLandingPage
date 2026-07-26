'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Music, AudioLines } from 'lucide-react';

const sheets = [
    {
        id: 'band',
        url: `${process.env.NEXT_PUBLIC_ASSET_BASE_URL}/pdf/LẠC MẤT MÙA XUÂN - LẮNG NGHE MÙA XUÂN VỀ.pdf`,
        icon: AudioLines,
    },
    {
        id: 'classical',
        url: `${process.env.NEXT_PUBLIC_ASSET_BASE_URL}/pdf/full - К О Л Ы Б Е Л Ь Н А Я П Е С Н Я.pdf`,
        icon: Music,
    }
];

export function SheetSection() {
    const t = useTranslations('sheet');
    const [activeSheet, setActiveSheet] = useState(sheets[0].id);

    const activeSheetUrl = sheets.find(s => s.id === activeSheet)?.url;

    return (
        <section className="py-24 sm:py-32 px-6 bg-white dark:bg-dark-umber">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
                {/* Left side: Sheet PDF */}
                <div className="w-full lg:w-1/2 order-2 lg:order-1">
                    {activeSheetUrl && (
                        <div className="w-full h-[600px] sm:h-[800px] rounded-2xl overflow-hidden shadow-2xl border border-dark-umber/10 dark:border-off-white/10 bg-white dark:bg-dark-umber/50">
                            <iframe 
                                src={`${activeSheetUrl}#toolbar=0`} 
                                width="100%" 
                                height="100%" 
                                className="border-0 w-full h-full"
                                title="Sheet Music PDF"
                            ></iframe>
                        </div>
                    )}
                </div>
                
                {/* Right side: Text and Buttons */}
                <div className="w-full lg:w-1/2 order-1 lg:order-2 text-left">
                    <h2 className="text-brick-red dark:text-warm-gold text-xs font-black uppercase tracking-[0.4em] mb-4 italic">
                        {t('label')}
                    </h2>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-dark-umber dark:text-off-white tracking-tighter mb-8 italic">
                        {t('heading')}
                    </h3>
                    <p className="text-soft-brown dark:text-off-white/70 mb-10 text-sm sm:text-base leading-relaxed">
                        {t('description')}
                    </p>
                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row flex-wrap gap-4">
                        {sheets.map(sheet => {
                            const Icon = sheet.icon;
                            return (
                                <button
                                    key={sheet.id}
                                    onClick={() => setActiveSheet(sheet.id)}
                                    className={`cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border px-6 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                                        activeSheet === sheet.id
                                            ? 'bg-warm-gold border-warm-gold text-dark-umber shadow-warm-gold/20'
                                            : 'border-dark-umber/10 bg-white text-dark-umber hover:border-warm-gold/40 hover:bg-warm-gold/10 dark:border-off-white/10 dark:bg-dark-umber dark:text-off-white dark:hover:bg-warm-gold/20'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {t(`buttons.${sheet.id}`)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
