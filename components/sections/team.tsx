import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export async function TeamSection() {
    const t = await getTranslations('team');

    const members = t.raw('members') as any[];

    return (
        <section className="py-32 bg-[#F3DDC5] dark:bg-soft-brown px-6">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-center text-4xl font-extrabold text-dark-umber dark:text-off-white tracking-tighter mb-20 italic">
                    {t('heading')}
                </h2>
                <div className="grid md:grid-cols-3 gap-12">
                    {members.map((member, idx) => (
                        <div
                            key={idx}
                            className="text-center group hover:-translate-y-1 transition-transform duration-300"
                        >
                            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-soft-brown dark:bg-dark-umber mb-6 grayscale group-hover:grayscale-0 transition duration-500 border-2 border-warm-gold/20 relative">
                                <Image
                                    src={`https://i.pravatar.cc/150?u=${idx}`}
                                    fill
                                    sizes="128px"
                                    loading="lazy"
                                    className="object-cover"
                                    alt={member.name}
                                />
                            </div>
                            <h4 className="font-bold text-dark-umber dark:text-off-white text-xl italic">
                                {member.name}
                            </h4>
                            <p className="text-[10px] text-warm-gold font-bold uppercase tracking-widest mb-4">
                                {member.role}
                            </p>
                            <p className="text-xs text-soft-brown dark:text-off-white/60 italic px-4 leading-relaxed">
                                {member.bio}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
