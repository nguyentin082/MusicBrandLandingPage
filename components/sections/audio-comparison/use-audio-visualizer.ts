import type { MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';

interface UseAudioVisualizerParams {
    canvasRef: MutableRefObject<HTMLCanvasElement | null>;
    analyser?: AnalyserNode;
    activeColor: string;
    isPlaying: boolean;
    activeTrackId: string;
    onTimelineTick: () => void;
}

export function useAudioVisualizer({
    canvasRef,
    analyser,
    activeColor,
    isPlaying,
    activeTrackId,
    onTimelineTick,
}: UseAudioVisualizerParams) {
    const rafRef = useRef<number | null>(null);
    const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
    const lastFrameRef = useRef(0);

    useEffect(() => {
        const draw = (timestamp: number) => {
            const canvas = canvasRef.current;

            if (!canvas || !analyser) {
                rafRef.current = requestAnimationFrame(draw);
                return;
            }

            const frameInterval = isPlaying ? 33 : 125;
            if (timestamp - lastFrameRef.current < frameInterval) {
                rafRef.current = requestAnimationFrame(draw);
                return;
            }
            lastFrameRef.current = timestamp;

            const context = canvas.getContext('2d');
            if (!context) {
                rafRef.current = requestAnimationFrame(draw);
                return;
            }

            const dpr = window.devicePixelRatio || 1;
            const cssWidth = Math.max(1, canvas.clientWidth);
            const cssHeight = Math.max(1, canvas.clientHeight);
            const nextWidth = Math.floor(cssWidth * dpr);
            const nextHeight = Math.floor(cssHeight * dpr);

            if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
                canvas.width = nextWidth;
                canvas.height = nextHeight;
            }

            context.setTransform(1, 0, 0, 1, 0, 0);
            context.scale(dpr, dpr);

            const bufferLength = analyser.frequencyBinCount;
            if (!dataArrayRef.current || dataArrayRef.current.length !== bufferLength) {
                dataArrayRef.current = new Uint8Array(new ArrayBuffer(bufferLength));
            }
            const dataArray = dataArrayRef.current;
            analyser.getByteFrequencyData(dataArray);

            context.clearRect(0, 0, cssWidth, cssHeight);

            const isMobile = cssWidth < 640;
            const bars = isMobile
                ? Math.min(32, Math.max(18, Math.floor(cssWidth / 16)))
                : Math.min(52, Math.max(28, Math.floor(cssWidth / 12)));
            const gap = Math.max(2, Math.floor(cssWidth / 180));
            const barWidth = (cssWidth - gap * (bars - 1)) / bars;
            const nyquist = ((analyser.context as AudioContext).sampleRate || 44100) / 2;
            const minFreq = 20;

            const isDarkMode = document.documentElement.classList.contains('dark');

            context.fillStyle = isDarkMode ? 'rgba(246, 244, 240, 0.1)' : 'rgba(59, 58, 53, 0.08)';

            for (let i = 0; i < bars; i += 1) {
                const x = i * (barWidth + gap);
                context.beginPath();
                context.roundRect(x, 0, barWidth, cssHeight, 999);
                context.fill();
            }

            const visualizerColor = isDarkMode && activeTrackId === 'raw' ? '#f6f4f0' : activeColor;
            const gradient = context.createLinearGradient(0, cssHeight, 0, 0);
            gradient.addColorStop(0, visualizerColor);
            gradient.addColorStop(1, `${visualizerColor}66`);
            context.fillStyle = gradient;

            for (let i = 0; i < bars; i += 1) {
                const startFreq = minFreq * Math.pow(nyquist / minFreq, i / bars);
                const endFreq = minFreq * Math.pow(nyquist / minFreq, (i + 1) / bars);
                const startIndex = Math.max(
                    0,
                    Math.min(
                        bufferLength - 1,
                        Math.floor((startFreq / nyquist) * (bufferLength - 1)),
                    ),
                );
                const endIndex = Math.max(
                    startIndex,
                    Math.min(bufferLength - 1, Math.ceil((endFreq / nyquist) * (bufferLength - 1))),
                );

                let sum = 0;
                let count = 0;
                for (let index = startIndex; index <= endIndex; index += 1) {
                    sum += dataArray[index];
                    count += 1;
                }

                const normalized = count > 0 ? sum / count / 255 : 0;
                const barHeight = Math.max(6, Math.pow(normalized, 0.82) * cssHeight);
                const x = i * (barWidth + gap);
                const y = cssHeight - barHeight;

                context.beginPath();
                context.roundRect(x, y, barWidth, barHeight, 999);
                context.fill();
            }

            if (isPlaying) {
                onTimelineTick();
            }

            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [activeColor, activeTrackId, analyser, canvasRef, isPlaying, onTimelineTick]);
}
