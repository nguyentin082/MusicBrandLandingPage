'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

import type { PortfolioProject } from './types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type EmbedPlatform = {
    key: string;
    label: string;
    embedHtml: string;
    height: number;
};

export type LinkPlatform = {
    key: string;
    label: string;
    url: string;
};

type PortfolioProjectDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    project: PortfolioProject | null;
    projectCoverImage: string;
    linkPlatforms: LinkPlatform[];
    embedPlatforms: EmbedPlatform[];
    activeEmbedKey: string;
    onActiveEmbedKeyChange: (key: string) => void;
    activeEmbedPlatform: EmbedPlatform | null;
};

function extractIframeSrc(embedHtml?: string) {
    if (!embedHtml) {
        return null;
    }

    const match = embedHtml.match(/src=['\"]([^'\"]+)['\"]/i);
    return match?.[1] ?? null;
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

export function PortfolioProjectDialog({
    isOpen,
    onOpenChange,
    project,
    projectCoverImage,
    linkPlatforms,
    embedPlatforms,
    activeEmbedKey,
    onActiveEmbedKeyChange,
    activeEmbedPlatform,
}: PortfolioProjectDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl border-dark-umber/20 bg-off-white p-5 sm:p-8 dark:border-off-white/20 dark:bg-dark-umber">
                {project && (
                    <div className="space-y-6">
                        <div className="grid gap-5 border-b border-dark-umber/15 pb-5 md:grid-cols-[180px_1fr] md:items-center dark:border-off-white/15">
                            <div className="relative aspect-4/5 max-w-45 overflow-hidden rounded-2xl bg-dark-umber/15">
                                <Image
                                    src={projectCoverImage}
                                    alt={project.title}
                                    fill
                                    sizes="180px"
                                    className="object-cover"
                                />
                            </div>

                            <div className="space-y-4">
                                <DialogHeader className="space-y-2 text-left">
                                    <DialogTitle className="text-2xl italic text-dark-umber dark:text-off-white md:text-3xl">
                                        {project.title}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm font-medium text-dark-umber/75 dark:text-off-white/75">
                                        {project.artist ?? 'Artist update soon'} • {project.genre}
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
                                    onValueChange={onActiveEmbedKeyChange}
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
                                    Du an nay hien chi co lien ket ngoai.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
