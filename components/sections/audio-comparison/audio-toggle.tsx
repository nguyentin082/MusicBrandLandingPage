'use client';

import { useCallback, useMemo, useRef } from 'react';

import { PlaybackControls } from './playback-controls';
import { AudioTrackTabs } from './track-tabs';
import type { AudioToggleProps } from './types';
import { getTrackColor } from './utils';
import { useAudioVisualizer } from './use-audio-visualizer';
import { useMultiTrackAudio } from './use-multi-track-audio';

export function AudioToggle({ trackTitle, playButton, pauseButton, tracks }: AudioToggleProps) {
    const {
        activeTrackId,
        activeTrack,
        analyserNodesRef,
        audioRefs,
        currentTime,
        duration,
        isPlaying,
        seek,
        setCurrentTime,
        switchTrack,
        togglePlay,
        handleTrackEnded,
        handleTrackMetadataLoaded,
    } = useMultiTrackAudio(tracks);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const lastTimelineSyncRef = useRef(0);

    const activeColor = useMemo(() => getTrackColor(activeTrack?.id), [activeTrack?.id]);

    const handleTimelineTick = useCallback(() => {
        const activeAudio = audioRefs.current[activeTrackId];
        if (!activeAudio) {
            return;
        }

        const now = performance.now();
        if (now - lastTimelineSyncRef.current >= 120) {
            setCurrentTime(activeAudio.currentTime);
            lastTimelineSyncRef.current = now;
        }
    }, [activeTrackId, audioRefs, setCurrentTime]);

    useAudioVisualizer({
        canvasRef,
        analyser: analyserNodesRef.current[activeTrackId],
        activeColor,
        isPlaying,
        activeTrackId,
        onTimelineTick: handleTimelineTick,
    });

    return (
        <div className="bg-white dark:bg-dark-umber p-8 md:p-12 rounded-[48px] border border-dark-umber/5 dark:border-off-white/10 shadow-xl flex flex-col gap-8">
            <div>
                <h4 className="text-xl font-bold italic mb-6 text-dark-umber dark:text-off-white">
                    {trackTitle}
                </h4>
                <AudioTrackTabs
                    tracks={tracks}
                    activeTrackId={activeTrackId}
                    onSwitchTrack={switchTrack}
                />
            </div>

            <div className="bg-off-white/70 dark:bg-soft-brown/40 rounded-3xl p-5 border border-dark-umber/10 dark:border-off-white/10">
                <canvas ref={canvasRef} className="h-24 md:h-28 w-full" />
            </div>

            <PlaybackControls
                isPlaying={isPlaying}
                playButton={playButton}
                pauseButton={pauseButton}
                currentTime={currentTime}
                duration={duration}
                onTogglePlay={togglePlay}
                onSeek={seek}
            />

            {tracks.map((track) => (
                <audio
                    key={track.id}
                    ref={(node) => {
                        audioRefs.current[track.id] = node;
                    }}
                    src={track.src}
                    crossOrigin="anonymous"
                    preload="auto"
                    onLoadedMetadata={() => {
                        handleTrackMetadataLoaded(track.id);
                    }}
                    onEnded={() => {
                        handleTrackEnded(track.id);
                    }}
                />
            ))}
        </div>
    );
}
