import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import type { AudioTrack } from './types';

type PlaybackController = {
    instanceId: string;
    pause: () => void;
};

let activePlaybackController: PlaybackController | null = null;

function registerActivePlaybackController(controller: PlaybackController) {
    if (activePlaybackController?.instanceId !== controller.instanceId) {
        activePlaybackController?.pause();
    }

    activePlaybackController = controller;
}

function clearPlaybackController(instanceId: string) {
    if (activePlaybackController?.instanceId === instanceId) {
        activePlaybackController = null;
    }
}

interface UseMultiTrackAudioResult {
    activeTrackId: string;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    activeTrack?: AudioTrack;
    audioRefs: MutableRefObject<Record<string, HTMLAudioElement | null>>;
    analyserNodesRef: MutableRefObject<Record<string, AnalyserNode>>;
    togglePlay: () => Promise<void>;
    switchTrack: (trackId: string) => void;
    seek: (nextTime: number) => void;
    setCurrentTime: (nextTime: number) => void;
    handleTrackMetadataLoaded: (trackId: string) => void;
    handleTrackEnded: (trackId: string) => void;
}

export function useMultiTrackAudio(tracks: AudioTrack[]): UseMultiTrackAudioResult {
    const instanceId = useId();
    const [activeTrackId, setActiveTrackId] = useState<string>(tracks[0]?.id ?? '');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
    const sourceNodesRef = useRef<Record<string, MediaElementAudioSourceNode>>({});
    const gainNodesRef = useRef<Record<string, GainNode>>({});
    const analyserNodesRef = useRef<Record<string, AnalyserNode>>({});
    const audioContextRef = useRef<AudioContext | null>(null);

    const activeTrack = useMemo(
        () => tracks.find((track) => track.id === activeTrackId) ?? tracks[0],
        [tracks, activeTrackId],
    );

    const ensureAudioContext = useCallback(() => {
        if (typeof window === 'undefined') {
            return null;
        }

        if (!audioContextRef.current) {
            audioContextRef.current = new window.AudioContext();
        }

        return audioContextRef.current;
    }, []);

    const ensureGraphForTrack = useCallback(
        (trackId: string) => {
            const context = ensureAudioContext();
            const audio = audioRefs.current[trackId];

            if (!context || !audio || sourceNodesRef.current[trackId]) {
                return;
            }

            const source = context.createMediaElementSource(audio);
            const analyser = context.createAnalyser();
            const gain = context.createGain();

            analyser.fftSize = 2048;
            analyser.minDecibels = -90;
            analyser.maxDecibels = -10;
            analyser.smoothingTimeConstant = 0.78;
            gain.gain.value = trackId === activeTrackId ? 1 : 0;

            source.connect(analyser);
            analyser.connect(gain);
            gain.connect(context.destination);

            sourceNodesRef.current[trackId] = source;
            analyserNodesRef.current[trackId] = analyser;
            gainNodesRef.current[trackId] = gain;
        },
        [activeTrackId, ensureAudioContext],
    );

    const updateActiveGain = useCallback((trackId: string) => {
        const context = audioContextRef.current;
        const now = context?.currentTime ?? 0;

        Object.entries(gainNodesRef.current).forEach(([id, gain]) => {
            gain.gain.cancelScheduledValues(now);
            gain.gain.linearRampToValueAtTime(id === trackId ? 1 : 0, now + 0.08);
        });
    }, []);

    const syncAllTracksTime = useCallback(
        (time: number) => {
            tracks.forEach((track) => {
                const audio = audioRefs.current[track.id];
                if (audio) {
                    audio.currentTime = time;
                }
            });
        },
        [tracks],
    );

    const pausePlayback = useCallback(() => {
        tracks.forEach((track) => audioRefs.current[track.id]?.pause());
        setIsPlaying(false);
        clearPlaybackController(instanceId);
    }, [instanceId, tracks]);

    const togglePlay = useCallback(async () => {
        if (!activeTrack) {
            return;
        }

        tracks.forEach((track) => ensureGraphForTrack(track.id));

        const context = ensureAudioContext();
        if (context && context.state === 'suspended') {
            await context.resume();
        }

        if (isPlaying) {
            pausePlayback();
            return;
        }

        registerActivePlaybackController({
            instanceId,
            pause: pausePlayback,
        });

        const leadTime = audioRefs.current[activeTrack.id]?.currentTime ?? currentTime;
        syncAllTracksTime(leadTime);

        await Promise.all(
            tracks.map(async (track) => {
                const audio = audioRefs.current[track.id];
                if (audio) {
                    await audio.play();
                }
            }),
        );

        updateActiveGain(activeTrack.id);
        setIsPlaying(true);
    }, [
        activeTrack,
        currentTime,
        ensureAudioContext,
        ensureGraphForTrack,
        isPlaying,
        instanceId,
        pausePlayback,
        syncAllTracksTime,
        tracks,
        updateActiveGain,
    ]);

    const switchTrack = useCallback(
        (trackId: string) => {
            if (trackId === activeTrackId) {
                return;
            }

            const playingTime = audioRefs.current[activeTrackId]?.currentTime ?? currentTime;
            syncAllTracksTime(playingTime);
            updateActiveGain(trackId);
            setActiveTrackId(trackId);
            setCurrentTime(playingTime);

            const switchedDuration = audioRefs.current[trackId]?.duration;
            if (switchedDuration && Number.isFinite(switchedDuration)) {
                setDuration(switchedDuration);
            }
        },
        [activeTrackId, currentTime, syncAllTracksTime, updateActiveGain],
    );

    const seek = useCallback(
        (nextTime: number) => {
            syncAllTracksTime(nextTime);
            setCurrentTime(nextTime);
        },
        [syncAllTracksTime],
    );

    const handleTrackMetadataLoaded = useCallback(
        (trackId: string) => {
            if (trackId !== activeTrackId) {
                return;
            }

            const trackDuration = audioRefs.current[trackId]?.duration;
            if (trackDuration && Number.isFinite(trackDuration)) {
                setDuration(trackDuration);
            }
        },
        [activeTrackId],
    );

    const handleTrackEnded = useCallback(
        (trackId: string) => {
            if (trackId !== activeTrackId) {
                return;
            }

            pausePlayback();
        },
        [activeTrackId, pausePlayback],
    );

    useEffect(() => {
        if (!activeTrack) {
            return;
        }

        const activeAudio = audioRefs.current[activeTrack.id];
        if (activeAudio && Number.isFinite(activeAudio.duration)) {
            setDuration(activeAudio.duration);
        }
    }, [activeTrack]);

    useEffect(() => {
        return () => {
            pausePlayback();

            const context = audioContextRef.current;
            if (context && context.state !== 'closed') {
                context.close();
            }
        };
    }, [pausePlayback, tracks]);

    return {
        activeTrackId,
        isPlaying,
        currentTime,
        duration,
        activeTrack,
        audioRefs,
        analyserNodesRef,
        togglePlay,
        switchTrack,
        seek,
        setCurrentTime,
        handleTrackMetadataLoaded,
        handleTrackEnded,
    };
}
