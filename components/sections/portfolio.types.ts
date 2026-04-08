export type PortfolioProject = {
    genre: string;
    title: string;
    artist?: string;
    spotifyUrl?: string;
    spotifyEmbedUrlLarge?: string;
    spotifyEmbedUrlSmall?: string;
    youtubeUrl?: string;
    youtubeEmbedUrl?: string;
    appleMusicUrl?: string;
    appleMusicEmbedUrl?: string;
    zingMp3Url?: string;
    zingMp3EmbedUrlSmall?: string;
    zingMp3EmbedUrlMedium?: string;
    zingMp3EmbedUrlLarge?: string;
    deezerUrl?: string;
    tidalUrl?: string;
    tidalEmbedUrl?: string;
    nhacCuaTuiUrl?: string;
};

export type PortfolioProjectWithCover = PortfolioProject & {
    coverImage: string;
};
