'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function LeadForm() {
    const t = useTranslations('ctaForm');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!formspreeId) {
            console.error("Missing NEXT_PUBLIC_FORMSPREE_ID in environment variables");
            setStatus('error');
            return;
        }

        setStatus('submitting');
        const form = e.currentTarget;
        const data = new FormData(form);

        try {
            const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
                method: 'POST',
                body: data,
                headers: {
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                setStatus('success');
                form.reset();
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-white/10 border border-dark-umber/20 rounded-3xl p-8 sm:p-12 text-center backdrop-blur-sm max-w-2xl mx-auto shadow-xl">
                <div className="w-16 h-16 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-dark-umber mb-4">{t('success.title')}</h3>
                <p className="text-dark-umber/70">{t('success.message')}</p>
                <button 
                    onClick={() => setStatus('idle')}
                    className="mt-8 px-6 py-2 bg-dark-umber/10 text-dark-umber hover:bg-dark-umber/20 rounded-xl transition font-medium text-sm"
                >
                    Gửi lại
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white/10 border border-dark-umber/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2 text-left">
                    <label htmlFor="name" className="text-sm font-bold text-dark-umber ml-2">{t('fields.name')}</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        required 
                        placeholder={t('fields.namePlaceholder')}
                        className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-dark-umber/20 focus:outline-none focus:ring-2 focus:ring-dark-umber/50 focus:border-transparent text-dark-umber placeholder:text-dark-umber/40 transition-all"
                    />
                </div>
                <div className="space-y-2 text-left">
                    <label htmlFor="phone" className="text-sm font-bold text-dark-umber ml-2">{t('fields.phone')}</label>
                    <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        required 
                        placeholder={t('fields.phonePlaceholder')}
                        className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-dark-umber/20 focus:outline-none focus:ring-2 focus:ring-dark-umber/50 focus:border-transparent text-dark-umber placeholder:text-dark-umber/40 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2 text-left">
                    <label htmlFor="email" className="text-sm font-bold text-dark-umber ml-2">{t('fields.email')}</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder={t('fields.emailPlaceholder')}
                        className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-dark-umber/20 focus:outline-none focus:ring-2 focus:ring-dark-umber/50 focus:border-transparent text-dark-umber placeholder:text-dark-umber/40 transition-all"
                    />
                </div>
                <div className="space-y-2 text-left">
                    <label htmlFor="service" className="text-sm font-bold text-dark-umber ml-2">{t('fields.service')}</label>
                    <div className="relative">
                        <select 
                            id="service" 
                            name="service" 
                            className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-dark-umber/20 focus:outline-none focus:ring-2 focus:ring-dark-umber/50 focus:border-transparent text-dark-umber appearance-none transition-all cursor-pointer"
                        >
                            <option value="Recording">{t('services.recording')}</option>
                            <option value="Mixing & Mastering">{t('services.mixing')}</option>
                            <option value="Full Production">{t('services.production')}</option>
                            <option value="Other">{t('services.other')}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-dark-umber/60">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2 text-left mb-8">
                <label htmlFor="message" className="text-sm font-bold text-dark-umber ml-2">{t('fields.message')}</label>
                <textarea 
                    id="message" 
                    name="message" 
                    rows={4}
                    placeholder={t('fields.messagePlaceholder')}
                    className="w-full px-5 py-4 rounded-2xl bg-white/50 border border-dark-umber/20 focus:outline-none focus:ring-2 focus:ring-dark-umber/50 focus:border-transparent text-dark-umber placeholder:text-dark-umber/40 resize-none transition-all"
                ></textarea>
            </div>

            {status === 'error' && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm font-medium text-center">
                    {t('error.message')}
                </div>
            )}

            <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full py-4 bg-dark-umber text-off-white font-bold rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-lg flex items-center justify-center gap-2"
            >
                {status === 'submitting' ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-off-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('submitting')}
                    </>
                ) : (
                    t('submit')
                )}
            </button>
        </form>
    );
}
