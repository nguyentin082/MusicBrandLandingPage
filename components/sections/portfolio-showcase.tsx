'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Play } from 'lucide-react';

import type {
    PortfolioProject,
    PortfolioProjectWithCover,
} from '@/components/sections/portfolio.types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type EmbedPlatform = {
    key: string;
    label: string;
    embedHtml: string;
    height: number;
};

type LinkPlatform = {
    key: string;
    label: string;
    url: string;
};

function extractIframeSrc(embedHtml?: string) {
    if (!embedHtml) {
        return null;
    }

    const match = embedHtml.match(/src=['\"]([^'\"]+)['\"]/i);
    return match?.[1] ?? null;
}

function getEmbedPlatforms(project: PortfolioProjectWithCover): EmbedPlatform[] {
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
            height: 315,
        },
    ].filter((platform) => Boolean(extractIframeSrc(platform.embedHtml)));
}

function getLinkPlatforms(project: PortfolioProjectWithCover): LinkPlatform[] {
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

function PlatformEmbed({ platform }: { platform: EmbedPlatform }) {
    const src = extractIframeSrc(platform.embedHtml);

    if (!src) {
        return (
            <div className="rounded-2xl border border-dashed border-dark-umber/30 p-6 text-sm text-dark-umber/70 dark:border-off-white/25 dark:text-off-white/70">
                Embed is not available for this platform.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-dark-umber/15 bg-black/5 dark:border-off-white/15 dark:bg-black/20">
            <iframe
                src={src}
                title={`${platform.label} embed player`}
                width="100%"
                height={platform.height}
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share"
                allowFullScreen
                className="block w-full"
            />
        </div>
    );
}

export function PortfolioShowcase({ projects }: { projects: PortfolioProjectWithCover[] }) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [activeEmbedKey, setActiveEmbedKey] = useState<string>('');
    const selectedProject = selectedIndex !== null ? projects[selectedIndex] : null;

    const projectCards = useMemo(
        () =>
            projects.map((project) => {
                const links = getLinkPlatforms(project);
                return {
                    ...project,
                    availableLinks: links.length,
                };
            }),
        [projects],
    );

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

    return (
        <>
            <div className="grid gap-8 md:grid-cols-3">
                {projectCards.map((project, idx) => {
                    return (
                        <button
                            key={`${project.title}-${idx}`}
                            type="button"
                            onClick={() => setSelectedIndex(idx)}
                            className={`group relative cursor-pointer overflow-hidden rounded-[40px] bg-dark-umber text-left transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold ${
                                idx === 1 ? 'aspect-4/5 md:aspect-3/4' : 'aspect-square'
                            }`}
                        >
                            <Image
                                src={project.coverImage}
                                alt={project.title}
                                fill
                                sizes="(max-width: 768px) 90vw, 30vw"
                                loading="lazy"
                                className="object-cover opacity-60 transition duration-700 group-hover:scale-105 group-hover:opacity-80"
                            />
                            <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/85 to-transparent p-8">
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

            <Dialog
                open={selectedProject !== null}
                onOpenChange={(open) => !open && setSelectedIndex(null)}
            >
                <DialogContent className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl border-dark-umber/20 bg-off-white p-5 sm:p-8 dark:border-off-white/20 dark:bg-dark-umber">
                    {selectedProject && (
                        <div className="space-y-6">
                            <div className="grid gap-5 border-b border-dark-umber/15 pb-5 md:grid-cols-[180px_1fr] md:items-center dark:border-off-white/15">
                                <div className="relative aspect-4/5 max-w-45 overflow-hidden rounded-2xl bg-dark-umber/15">
                                    <Image
                                        src={selectedProject.coverImage}
                                        alt={selectedProject.title}
                                        fill
                                        sizes="180px"
                                        className="object-cover"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <DialogHeader className="space-y-2 text-left">
                                        <DialogTitle className="text-2xl italic text-dark-umber dark:text-off-white md:text-3xl">
                                            {selectedProject.title}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-dark-umber/75 dark:text-off-white/75">
                                            {selectedProject.artist ?? 'Artist update soon'} •{' '}
                                            {selectedProject.genre}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="flex flex-wrap gap-2">
                                        {linkPlatforms.map((platform) => (
                                            <Button
                                                key={platform.key}
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full border-dark-umber/20 bg-white/70 hover:bg-white dark:border-off-white/25 dark:bg-off-white/5 dark:hover:bg-off-white/10"
                                            >
                                                <a
                                                    href={platform.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5"
                                                >
                                                    {platform.label}
                                                    <ExternalLink className="size-3.5" />
                                                </a>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                {embedPlatforms.length > 0 ? (
                                    <Tabs
                                        value={activeEmbedKey}
                                        onValueChange={setActiveEmbedKey}
                                        className="gap-4"
                                    >
                                        <TabsList className="h-auto w-full flex-wrap justify-start rounded-xl bg-dark-umber/10 p-1 dark:bg-off-white/10">
                                            {embedPlatforms.map((platform) => (
                                                <TabsTrigger
                                                    key={platform.key}
                                                    value={platform.key}
                                                    className="rounded-lg px-3 py-2"
                                                >
                                                    {platform.label}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>

                                        {activeEmbedPlatform && (
                                            <TabsContent
                                                value={activeEmbedPlatform.key}
                                                className="pt-1"
                                            >
                                                <PlatformEmbed platform={activeEmbedPlatform} />
                                            </TabsContent>
                                        )}
                                    </Tabs>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-dark-umber/25 p-6 text-sm text-dark-umber/70 dark:border-off-white/25 dark:text-off-white/70">
                                        Dự án này hiện chỉ có liên kết ngoài.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
