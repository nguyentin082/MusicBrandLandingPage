import { getTranslations } from 'next-intl/server';

import { PortfolioShowcase } from './showcase';
import { PortfolioProject } from './types';
import { siteConfig } from '@/lib/site';
import { resolveMediaUrl, toAbsoluteUrl } from '@/lib/media';

export async function PortfolioSection() {
    const t = await getTranslations('portfolio');

    const projects = t.raw('projects') as PortfolioProject[];
    const fallbackCoverImage = 'https://dummyimage.com/1200x1500/f5f1e8/8a7f73.png&text=loading...';

    const portfolioJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: t('heading'),
        itemListElement: projects.map((project, index) => {
            const imageUrl = resolveMediaUrl(project.coverImage, fallbackCoverImage);

            return {
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'MusicRecording',
                    name: project.title,
                    genre: project.genre,
                    byArtist: project.artist
                        ? {
                              '@type': 'MusicGroup',
                              name: project.artist,
                          }
                        : undefined,
                    image: toAbsoluteUrl(imageUrl, siteConfig.url),
                    sameAs: [
                        project.spotifyUrl,
                        project.youtubeUrl,
                        project.appleMusicUrl,
                        project.zingMp3Url,
                        project.tidalUrl,
                        project.deezerUrl,
                        project.nhacCuaTuiUrl,
                    ].filter(Boolean),
                },
            };
        }),
    };

    return (
        <section id="portfolio" className="py-32 px-6 bg-off-white dark:bg-dark-umber">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-extrabold text-dark-umber dark:text-off-white tracking-tighter mb-16 italic text-center">
                    {t('heading')}
                </h2>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioJsonLd) }}
                />

                <ul className="sr-only" aria-label={t('heading')}>
                    {projects.map((project, index) => (
                        <li key={`${project.title}-${index}`}>
                            <h3>{project.title}</h3>
                            {project.artist && <p>{project.artist}</p>}
                            <p>{project.genre}</p>
                            {project.spotifyUrl && <a href={project.spotifyUrl}>Spotify</a>}
                            {project.youtubeUrl && <a href={project.youtubeUrl}>YouTube</a>}
                            {project.appleMusicUrl && (
                                <a href={project.appleMusicUrl}>Apple Music</a>
                            )}
                            {project.zingMp3Url && <a href={project.zingMp3Url}>Zing MP3</a>}
                            {project.tidalUrl && <a href={project.tidalUrl}>TIDAL</a>}
                            {project.deezerUrl && <a href={project.deezerUrl}>Deezer</a>}
                            {project.nhacCuaTuiUrl && (
                                <a href={project.nhacCuaTuiUrl}>NhacCuaTui</a>
                            )}
                        </li>
                    ))}
                </ul>

                <PortfolioShowcase projects={projects} />
            </div>
        </section>
    );
}
