import { Pause, Play } from 'lucide-react';
import { memo } from 'react';

import { formatTime } from './utils';

interface PlaybackControlsProps {
    isPlaying: boolean;
    playButton: string;
    pauseButton: string;
    currentTime: number;
    duration: number;
    onTogglePlay: () => void | Promise<void>;
    onSeek: (nextTime: number) => void;
}

export const PlaybackControls = memo(function PlaybackControls({
    isPlaying,
    playButton,
    pauseButton,
    currentTime,
    duration,
    onTogglePlay,
    onSeek,
}: PlaybackControlsProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => {
                        void onTogglePlay();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-dark-umber text-white dark:bg-off-white dark:text-dark-umber font-semibold text-sm"
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? pauseButton : playButton}
                </button>
                <p className="text-sm font-semibold text-dark-umber/70 dark:text-off-white/70">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </p>
            </div>

            <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.01}
                value={duration ? currentTime : 0}
                onChange={(event) => onSeek(Number(event.target.value))}
                className="w-full accent-brick-red"
            />
        </div>
    );
});
