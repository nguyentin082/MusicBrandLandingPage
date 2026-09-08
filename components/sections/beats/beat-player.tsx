'use client';

import { useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Disc, Music } from 'lucide-react';
import { PlaybackControls } from '../audio-comparison/playback-controls';
import { useMultiTrackAudio } from '../audio-comparison/use-multi-track-audio';
import { useAudioVisualizer } from '../audio-comparison/use-audio-visualizer';
import type { BeatPlayerProps } from './types';

export function BeatPlayer({ track, playButton, pauseButton }: BeatPlayerProps) {
    const internalTracks = useMemo(() => [{ id: 'main', label: track.title, src: track.src }], [track.title, track.src]);

    const {
        activeTrackId,
        analyserNodesRef,
        audioRefs,
        currentTime,
        duration,
        isPlaying,
        seek,
        setCurrentTime,
        togglePlay,
        handleTrackEnded,
        handleTrackMetadataLoaded,
    } = useMultiTrackAudio(internalTracks);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const lastTimelineSyncRef = useRef(0);

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
        activeColor: '#bf3b2b', // brick-red hex so that appending '66' makes it a valid 8-digit hex
        isPlaying,
        activeTrackId,
        onTimelineTick: handleTimelineTick,
    });

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.5 }}
            className="group relative bg-white/80 dark:bg-dark-umber/80 backdrop-blur-xl p-8 md:p-10 rounded-[40px] border border-dark-umber/10 dark:border-off-white/10 shadow-2xl overflow-hidden flex flex-col gap-8"
        >
            {/* Background glowing effect when playing */}
            <motion.div 
                animate={{ 
                    opacity: isPlaying ? 0.15 : 0,
                    scale: isPlaying ? 1.1 : 1
                }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-gradient-to-tr from-brick-red to-warm-gold blur-3xl pointer-events-none rounded-[40px]"
            />

            {/* Top Section: Vinyl & Titles */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-center z-10 w-full">
                {/* Spinning Vinyl Record */}
                <div className="relative flex-shrink-0 cursor-pointer" onClick={() => { void togglePlay(); }}>
                    <motion.div 
                        animate={{ rotate: isPlaying ? 360 : 0 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className={`w-28 h-28 md:w-36 md:h-36 rounded-full bg-dark-umber flex items-center justify-center border-4 border-dark-umber/20 dark:border-off-white/20 shadow-xl transition-shadow ${isPlaying ? 'shadow-brick-red/30' : ''}`}
                    >
                        {/* Vinyl grooves */}
                        <div className="absolute inset-2 rounded-full border border-white/10 pointer-events-none" />
                        <div className="absolute inset-6 rounded-full border border-white/5 pointer-events-none" />
                        <div className="absolute inset-10 rounded-full border border-white/10 pointer-events-none" />
                        
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brick-red flex items-center justify-center relative">
                            <div className="w-3 h-3 md:w-4 md:h-4 bg-off-white rounded-full absolute z-10" />
                            <Disc className="text-white w-6 h-6 md:w-8 md:h-8 opacity-50 z-0" />
                        </div>
                    </motion.div>
                    
                    {/* Floating music notes when playing */}
                    {isPlaying && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.5, x: 0 }}
                                animate={{ opacity: [0, 1, 0], y: -60, scale: 1.5, x: 20 }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                                className="absolute top-2 right-2 text-brick-red dark:text-warm-gold z-20 pointer-events-none"
                            >
                                <Music size={16} />
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.5, x: 0 }}
                                animate={{ opacity: [0, 1, 0], y: -50, scale: 1.2, x: -20 }}
                                transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}
                                className="absolute top-1/2 -left-4 text-warm-gold z-20 pointer-events-none"
                            >
                                <Music size={12} />
                            </motion.div>
                        </>
                    )}
                </div>

                {/* Titles */}
                <div className="text-center sm:text-left flex-1">
                    <p className="text-xs font-black text-brick-red dark:text-warm-gold uppercase tracking-[0.2em] mb-2">
                        {track.genre}
                    </p>
                    <h4 className="text-2xl md:text-3xl font-extrabold italic mb-2 text-dark-umber dark:text-off-white">
                        {track.title}
                    </h4>
                    <p className="text-sm text-dark-umber/70 dark:text-off-white/70 line-clamp-2">
                        {track.description}
                    </p>
                </div>
            </div>

            {/* Bottom Section: Visualizer & Controls */}
            <div className="w-full flex flex-col z-10">
                <div className="w-full mb-6 bg-off-white/70 dark:bg-soft-brown/40 rounded-3xl p-5 border border-dark-umber/10 dark:border-off-white/10">
                    <canvas ref={canvasRef} className="h-16 md:h-20 w-full" />
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
            </div>

            <audio
                ref={(node) => {
                    audioRefs.current[activeTrackId] = node;
                }}
                src={track.src}
                crossOrigin="anonymous"
                preload="auto"
                onLoadedMetadata={() => {
                    handleTrackMetadataLoaded(activeTrackId);
                }}
                onEnded={() => {
                    handleTrackEnded(activeTrackId);
                }}
            />
        </motion.div>
    );
}
