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
        <section className="py-16 sm:py-24 md:py-32 bg-white dark:bg-soft-brown px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-dark-umber dark:text-off-white tracking-tighter mb-12 sm:mb-16 md:mb-20 italic">
                    {t('heading')}
                </h2>
                <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 group/team-list">
                    {members.map((member, idx) => (
                        <div
                            key={idx}
                            tabIndex={0}
                            className={`w-full sm:w-[calc((100%-2rem)/2)] ${
                                idx < 2 ? 'md:w-[calc((100%-3rem)/2)]' : 'md:w-[calc((100%-6rem)/3)]'
                            } relative isolate text-center group/member rounded-2xl p-6 outline-none transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:group-hover/team-list:opacity-35 md:group-hover/team-list:scale-[0.98] md:hover:opacity-100! md:hover:scale-[1.04] md:hover:-translate-y-3 md:hover:shadow-[0_24px_55px_rgba(0,0,0,0.4)] focus-visible:opacity-100! focus-visible:scale-[1.04] focus-visible:-translate-y-3 focus-visible:shadow-[0_24px_55px_rgba(0,0,0,0.4)] focus-visible:ring-2 focus-visible:ring-warm-gold/55`}
                        >
                            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-b from-warm-gold/0 via-warm-gold/0 to-warm-gold/0 opacity-0 blur-xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/member:from-warm-gold/12 group-hover/member:via-warm-gold/7 group-hover/member:to-transparent group-hover/member:opacity-100 group-focus-visible/member:opacity-100" />
                            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-warm-gold/0 transition-colors duration-500 group-hover/member:border-warm-gold/35 group-focus-visible/member:border-warm-gold/35" />
                            <div className={`mx-auto rounded-full overflow-hidden bg-off-white dark:bg-off-white mb-4 sm:mb-6 transition duration-700 border-2 border-warm-gold/20 group-hover/member:border-warm-gold/80 group-focus-visible/member:border-warm-gold/80 relative ${
                                idx < 2 ? 'w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40' : 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32'
                            }`}>
                                <Image
                                    src={resolveMediaUrl(member.avatar)}
                                    fill
                                    sizes={idx < 2 ? "(max-width: 640px) 112px, (max-width: 768px) 128px, 160px" : "(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"}
                                    loading="lazy"
                                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/member:scale-110 group-focus-visible/member:scale-110"
                                    alt={member.name}
                                />
                            </div>
                            <h3 className={`font-bold text-dark-umber dark:text-off-white italic transition-colors duration-500 group-hover/member:text-warm-gold group-focus-visible/member:text-warm-gold ${
                                idx < 2 ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                            }`}>
                                {member.name}
                            </h3>
                            <p className={`text-warm-gold font-bold uppercase tracking-widest mb-3 sm:mb-4 ${
                                idx < 2 ? 'text-[10px] sm:text-xs' : 'text-[9px] sm:text-[10px]'
                            }`}>
                                {member.role}
                            </p>
                            <p className={`text-dark-umber/70 dark:text-off-white/60 px-2 sm:px-4 leading-relaxed ${
                                idx < 2 ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'
                            }`}>
                                {member.bio}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
