import { memo } from 'react';

import type { AudioTrack } from './types';

interface AudioTrackTabsProps {
    tracks: AudioTrack[];
    activeTrackId: string;
    onSwitchTrack: (trackId: string) => void;
}

export const AudioTrackTabs = memo(function AudioTrackTabs({
    tracks,
    activeTrackId,
    onSwitchTrack,
}: AudioTrackTabsProps) {
    return (
        <div className="flex flex-wrap gap-3">
            {tracks.map((track) => (
                <button
                    key={track.id}
                    onClick={() => onSwitchTrack(track.id)}
                    className={`px-5 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition ${
                        activeTrackId === track.id
                            ? track.id === 'master'
                                ? 'bg-brick-red text-white shadow-lg'
                                : track.id === 'vocal'
                                  ? 'bg-warm-gold text-dark-umber shadow-lg'
                                  : 'bg-dark-umber text-white dark:bg-off-white dark:text-dark-umber shadow-lg'
                            : 'border border-dark-umber dark:border-off-white text-dark-umber dark:text-off-white hover:bg-dark-umber/5 dark:hover:bg-off-white/5'
                    }`}
                >
                    {track.label}
                </button>
            ))}
        </div>
    );
});
