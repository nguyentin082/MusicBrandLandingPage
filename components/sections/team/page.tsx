import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

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
        <section className="py-32 bg-dark-umber dark:bg-dark-umber px-6">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-center text-4xl font-extrabold text-off-white dark:text-off-white tracking-tighter mb-20 italic">
                    {t('heading')}
                </h2>
                <div className="grid md:grid-cols-3 gap-12">
                    {members.map((member, idx) => (
                        <div
                            key={idx}
                            className="text-center group hover:-translate-y-1 transition-transform duration-300"
                        >
                            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-off-white dark:bg-off-white mb-6 grayscale group-hover:grayscale-0 transition duration-500 border-2 border-warm-gold/20 relative">
                                <Image
                                    src={member.avatar}
                                    fill
                                    sizes="128px"
                                    loading="lazy"
                                    className="object-cover"
                                    alt={member.name}
                                />
                            </div>
                            <h4 className="font-bold text-off-white dark:text-off-white text-xl italic">
                                {member.name}
                            </h4>
                            <p className="text-[10px] text-warm-gold font-bold uppercase tracking-widest mb-4">
                                {member.role}
                            </p>
                            <p className="text-xs text-off-white/60 dark:text-off-white/60 italic px-4 leading-relaxed">
                                {member.bio}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
