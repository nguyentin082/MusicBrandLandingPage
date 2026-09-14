export interface AudioTrack {
    id: string;
    label: string;
    src: string;
}

export interface AudioToggleProps {
    trackTitle: string;
    playButton: string;
    pauseButton: string;
    seekLabel: string;
    tracks: AudioTrack[];
}
