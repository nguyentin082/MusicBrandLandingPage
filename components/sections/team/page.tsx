import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/media';

type TeamMember = {
    name: string;
    role: string;
    bio: string;
    avatar: string;
};

export async function TeamSection() {
    const t = await getTranslations('team');

    const members = t.raw('members') as TeamMember[];

    return (
        <section className="py-16 sm:py-24 md:py-32 bg-dark-umber dark:bg-dark-umber px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-off-white dark:text-off-white tracking-tighter mb-12 sm:mb-16 md:mb-20 italic">
                    {t('heading')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 group/team-list">
                    {members.map((member, idx) => (
                        <div
                            key={idx}
                            tabIndex={0}
                            className="relative isolate text-center group/member rounded-2xl p-6 outline-none transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:group-hover/team-list:opacity-35 md:group-hover/team-list:scale-[0.98] md:hover:opacity-100! md:hover:scale-[1.04] md:hover:-translate-y-3 md:hover:shadow-[0_24px_55px_rgba(0,0,0,0.4)] focus-visible:opacity-100! focus-visible:scale-[1.04] focus-visible:-translate-y-3 focus-visible:shadow-[0_24px_55px_rgba(0,0,0,0.4)] focus-visible:ring-2 focus-visible:ring-warm-gold/55"
                        >
                            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-b from-warm-gold/0 via-warm-gold/0 to-warm-gold/0 opacity-0 blur-xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/member:from-warm-gold/12 group-hover/member:via-warm-gold/7 group-hover/member:to-transparent group-hover/member:opacity-100 group-focus-visible/member:opacity-100" />
                            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-warm-gold/0 transition-colors duration-500 group-hover/member:border-warm-gold/35 group-focus-visible/member:border-warm-gold/35" />
                            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden bg-off-white dark:bg-off-white mb-4 sm:mb-6 grayscale group-hover/member:grayscale-0 group-focus-visible/member:grayscale-0 transition duration-700 border-2 border-warm-gold/20 group-hover/member:border-warm-gold/80 group-focus-visible/member:border-warm-gold/80 relative">
                                <Image
                                    src={resolveMediaUrl(member.avatar)}
                                    fill
                                    sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                                    loading="lazy"
                                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/member:scale-110 group-focus-visible/member:scale-110"
                                    alt={member.name}
                                />
                            </div>
                            <h4 className="font-bold text-off-white dark:text-off-white text-lg sm:text-xl italic transition-colors duration-500 group-hover/member:text-warm-gold group-focus-visible/member:text-warm-gold">
                                {member.name}
                            </h4>
                            <p className="text-[9px] sm:text-[10px] text-warm-gold font-bold uppercase tracking-widest mb-3 sm:mb-4">
                                {member.role}
                            </p>
                            <p className="text-[11px] sm:text-xs text-off-white/60 dark:text-off-white/60 italic px-2 sm:px-4 leading-relaxed">
                                {member.bio}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
