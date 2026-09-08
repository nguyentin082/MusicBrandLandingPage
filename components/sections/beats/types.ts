export interface BeatTrack {
    title: string;
    genre: string;
    description: string;
    src: string;
}

export interface BeatPlayerProps {
    track: BeatTrack;
    playButton: string;
    pauseButton: string;
}
