'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

import { PortfolioProjectDialog } from './project-dialog';
import type { EmbedPlatform, LinkPlatform } from './project-dialog';
import type { PortfolioProject } from './types';

type PortfolioCard = PortfolioProject & {
    sourceIndex: number;
    availableLinks: number;
    normalizedTitle: string;
};

const PORTFOLIO_FALLBACK_COVER_IMAGE =
    'https://dummyimage.com/1200x1500/f5f1e8/8a7f73.png&text=loading...';

function normalizeForSearch(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function hasTetLaNhaProject(project: { normalizedTitle: string; coverImage?: string }) {
    const normalizedCoverImage = normalizeForSearch(project.coverImage ?? '');
    return (
        normalizedCoverImage.includes('tet-la-nha') ||
        project.normalizedTitle.includes('tet la nha') ||
        project.normalizedTitle.includes('tet is home')
    );
}

function hasCamOnKhongTuBoProject(project: { normalizedTitle: string; coverImage?: string }) {
    const normalizedCoverImage = normalizeForSearch(project.coverImage ?? '');
    return (
        normalizedCoverImage.includes('cam-on-em-vi-da-khong-tu-bo') ||
        (project.normalizedTitle.includes('cam on') &&
            project.normalizedTitle.includes('khong tu bo')) ||
        (project.normalizedTitle.includes('thank you') &&
            project.normalizedTitle.includes('not giving up'))
    );
}

function resolveCoverImage(coverImage?: string) {
    return coverImage ?? PORTFOLIO_FALLBACK_COVER_IMAGE;
}

function extractIframeSrc(embedHtml?: string) {
    if (!embedHtml) {
        return null;
    }

    const match = embedHtml.match(/src=['\"]([^'\"]+)['\"]/i);
    return match?.[1] ?? null;
}

function getEmbedPlatforms(project: PortfolioProject): EmbedPlatform[] {
    return [
        {
            key: 'spotify',
            label: 'Spotify',
            embedHtml: project.spotifyEmbedUrlLarge ?? project.spotifyEmbedUrlSmall ?? '',
            height: 352,
        },
        {
            key: 'youtube',
            label: 'YouTube',
            embedHtml: project.youtubeEmbedUrl ?? '',
            height: 352,
        },
    ].filter((platform) => Boolean(extractIframeSrc(platform.embedHtml)));
}

function getLinkPlatforms(project: PortfolioProject): LinkPlatform[] {
    return [
        { key: 'spotifyUrl', label: 'Spotify', url: project.spotifyUrl ?? '' },
        { key: 'youtubeUrl', label: 'YouTube', url: project.youtubeUrl ?? '' },
        { key: 'appleMusicUrl', label: 'Apple Music', url: project.appleMusicUrl ?? '' },
        { key: 'zingMp3Url', label: 'Zing MP3', url: project.zingMp3Url ?? '' },
        { key: 'tidalUrl', label: 'TIDAL', url: project.tidalUrl ?? '' },
        { key: 'deezerUrl', label: 'Deezer', url: project.deezerUrl ?? '' },
        { key: 'nhacCuaTuiUrl', label: 'NhacCuaTui', url: project.nhacCuaTuiUrl ?? '' },
    ].filter((platform) => Boolean(platform.url));
}

export function PortfolioShowcase({ projects }: { projects: PortfolioProject[] }) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [activeEmbedKey, setActiveEmbedKey] = useState<string>('');
    const [activeMobileIndex, setActiveMobileIndex] = useState(0);
    const mobileScrollRef = useRef<HTMLDivElement | null>(null);
    const selectedProject = selectedIndex !== null ? projects[selectedIndex] : null;
    const selectedProjectCoverImage = resolveCoverImage(selectedProject?.coverImage);

    const projectCards = useMemo<PortfolioCard[]>(() => {
        const cards = projects.map((project, sourceIndex) => {
            const links = getLinkPlatforms(project);
            return {
                ...project,
                sourceIndex,
                availableLinks: links.length,
                normalizedTitle: normalizeForSearch(project.title),
            };
        });

        const featuredIndex = cards.findIndex((card) => hasTetLaNhaProject(card));
        if (featuredIndex <= 0) {
            return cards;
        }

        const [featuredCard] = cards.splice(featuredIndex, 1);
        cards.unshift(featuredCard);
        return cards;
    }, [projects]);

    const embedPlatforms = useMemo(
        () => (selectedProject ? getEmbedPlatforms(selectedProject) : []),
        [selectedProject],
    );

    const linkPlatforms = useMemo(
        () => (selectedProject ? getLinkPlatforms(selectedProject) : []),
        [selectedProject],
    );

    useEffect(() => {
        if (!selectedProject) {
            setActiveEmbedKey('');
            return;
        }

        setActiveEmbedKey(embedPlatforms[0]?.key ?? '');
    }, [selectedProject, embedPlatforms]);

    const activeEmbedPlatform = useMemo(
        () => embedPlatforms.find((platform) => platform.key === activeEmbedKey) ?? null,
        [embedPlatforms, activeEmbedKey],
    );

    const desktopColumns = useMemo(() => {
        const columns: PortfolioCard[][] = [[], [], []];
        const remainingCards = [...projectCards];

        const camOnIndex = remainingCards.findIndex((card) => hasCamOnKhongTuBoProject(card));
        if (camOnIndex >= 0) {
            const [camOnCard] = remainingCards.splice(camOnIndex, 1);
            columns[2].push(camOnCard);
        }

        const tetIndex = remainingCards.findIndex((card) => hasTetLaNhaProject(card));
        if (tetIndex >= 0) {
            const [tetCard] = remainingCards.splice(tetIndex, 1);
            columns[0].push(tetCard);
        }

        // Fill the middle column first for balanced reading flow, then left column.
        remainingCards.forEach((card) => {
            if (columns[1].length <= columns[0].length) {
                columns[1].push(card);
                return;
            }

            columns[0].push(card);
        });

        return columns;
    }, [projectCards]);

    const updateActiveMobileIndex = () => {
        const container = mobileScrollRef.current;
        if (!container) {
            return;
        }

        const cardElements = Array.from(container.children) as HTMLElement[];
        if (cardElements.length === 0) {
            return;
        }

        const viewportCenter = container.scrollLeft + container.clientWidth / 2;
        let nearestIdx = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        cardElements.forEach((card, idx) => {
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            const distance = Math.abs(cardCenter - viewportCenter);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIdx = idx;
            }
        });

        setActiveMobileIndex(nearestIdx);
    };

    const scrollToMobileCard = (idx: number) => {
        const container = mobileScrollRef.current;
        if (!container) {
            return;
        }

        const targetCard = container.children[idx] as HTMLElement | undefined;
        if (!targetCard) {
            return;
        }

        container.scrollTo({
            left: targetCard.offsetLeft - 24,
            behavior: 'smooth',
        });
        setActiveMobileIndex(idx);
    };

    return (
        <>
            <div
                ref={mobileScrollRef}
                onScroll={updateActiveMobileIndex}
                className="md:hidden -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                {projectCards.map((project, idx) => {
                    const isFeatured = idx === 0 && hasTetLaNhaProject(project);
                    const projectCoverImage = resolveCoverImage(project.coverImage);

                    return (
                        <button
                            key={`${project.title}-${project.sourceIndex}`}
                            type="button"
                            onClick={() => setSelectedIndex(project.sourceIndex)}
                            className={`group relative shrink-0 snap-center cursor-pointer overflow-hidden rounded-4xl bg-dark-umber text-left transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold ${
                                isFeatured ? 'w-[86vw] aspect-4/5' : 'w-[76vw] aspect-square'
                            }`}
                        >
                            <Image
                                src={projectCoverImage}
                                alt={project.title}
                                fill
                                sizes="86vw"
                                loading="lazy"
                                className="object-cover opacity-60 transition duration-700 group-hover:scale-105 group-hover:opacity-80"
                            />
                            <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/85 to-transparent p-6">
                                {isFeatured && (
                                    <span className="mb-3 inline-flex w-fit rounded-full bg-warm-gold/90 px-3 py-1 text-[10px] font-black tracking-wider text-dark-umber uppercase">
                                        Spotlight
                                    </span>
                                )}
                                <p className="mb-2 text-xs font-bold tracking-widest text-warm-gold uppercase">
                                    {project.genre}
                                </p>
                                <h4 className="text-2xl font-bold italic text-off-white">
                                    {project.title}
                                </h4>
                                {project.artist && (
                                    <p className="mt-1 text-sm font-medium text-off-white/80">
                                        {project.artist}
                                    </p>
                                )}
                                <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-off-white/80">
                                    <Play className="size-3.5" />
                                    {project.availableLinks} nền tảng khả dụng
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div
                className="md:hidden mt-2 flex items-center justify-center gap-2"
                aria-label="Portfolio slide indicators"
            >
                {projectCards.map((project, idx) => (
                    <button
                        key={`${project.title}-dot-${project.sourceIndex}`}
                        type="button"
                        onClick={() => scrollToMobileCard(idx)}
                        aria-label={`Go to project ${idx + 1}`}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                            idx === activeMobileIndex
                                ? 'w-6 bg-warm-gold'
                                : 'w-2.5 bg-dark-umber/30 dark:bg-off-white/30'
                        }`}
                    />
                ))}
            </div>

            <div className="hidden md:grid md:grid-cols-3 md:h-152 lg:h-168 gap-6 items-stretch">
                {desktopColumns.map((columnCards, columnIdx) => (
                    <div key={`column-${columnIdx}`} className="grid h-full grid-rows-3 gap-6">
                        {columnCards.map((project, cardIdx) => {
                            const isTetSpotlight = hasTetLaNhaProject(project);
                            const isCamOnProject = hasCamOnKhongTuBoProject(project);
                            const projectCoverImage = resolveCoverImage(project.coverImage);
                            const rowSpanClass =
                                columnCards.length === 1
                                    ? 'row-span-3'
                                    : columnCards.length === 2
                                      ? cardIdx === 0
                                          ? 'row-span-2'
                                          : 'row-span-1'
                                      : 'row-span-1';

                            return (
                                <button
                                    key={`${project.title}-${project.sourceIndex}`}
                                    type="button"
                                    onClick={() => setSelectedIndex(project.sourceIndex)}
                                    className={`group relative h-full cursor-pointer overflow-hidden text-left transition-transform duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold ${rowSpanClass} ${
                                        isTetSpotlight ? 'rounded-[40px]' : 'rounded-4xl'
                                    } bg-dark-umber`}
                                >
                                    <Image
                                        src={projectCoverImage}
                                        alt={project.title}
                                        fill
                                        sizes="(max-width: 1280px) 32vw, 30vw"
                                        loading="lazy"
                                        className={`object-cover transition duration-700 group-hover:scale-105 ${
                                            isTetSpotlight
                                                ? 'opacity-80 group-hover:opacity-95'
                                                : 'opacity-65 group-hover:opacity-85'
                                        }`}
                                    />
                                    <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/85 to-transparent p-6">
                                        {isTetSpotlight && (
                                            <span className="mb-3 inline-flex w-fit rounded-full bg-warm-gold/90 px-3 py-1 text-[10px] font-black tracking-wider text-dark-umber uppercase">
                                                Spotlight
                                            </span>
                                        )}
                                        {isCamOnProject && (
                                            <span className="mb-3 inline-flex w-fit rounded-full bg-off-white/85 px-3 py-1 text-[10px] font-black tracking-wider text-dark-umber uppercase">
                                                Signature Release
                                            </span>
                                        )}
                                        <p className="mb-2 text-xs font-bold tracking-widest text-warm-gold uppercase">
                                            {project.genre}
                                        </p>
                                        <h4
                                            className={`font-bold italic text-off-white ${
                                                isTetSpotlight ? 'text-3xl' : 'text-xl'
                                            }`}
                                        >
                                            {project.title}
                                        </h4>
                                        {project.artist && (
                                            <p
                                                className={`mt-1 font-medium text-off-white/80 ${
                                                    isTetSpotlight ? 'text-base' : 'text-sm'
                                                }`}
                                            >
                                                {project.artist}
                                            </p>
                                        )}
                                        <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-off-white/80">
                                            <Play className="size-3.5" />
                                            {project.availableLinks} nền tảng khả dụng
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            <PortfolioProjectDialog
                isOpen={selectedProject !== null}
                onOpenChange={(open) => !open && setSelectedIndex(null)}
                project={selectedProject}
                projectCoverImage={selectedProjectCoverImage}
                linkPlatforms={linkPlatforms}
                embedPlatforms={embedPlatforms}
                activeEmbedKey={activeEmbedKey}
                onActiveEmbedKeyChange={setActiveEmbedKey}
                activeEmbedPlatform={activeEmbedPlatform}
            />
        </>
    );
}
