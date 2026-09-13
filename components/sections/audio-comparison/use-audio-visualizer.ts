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

const PLAYING_FRAME_INTERVAL = 33;

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
        // Draws exactly one frame. Returns false when the canvas is not laid out
        // yet so the caller can repaint once it has a measurable size.
        const paint = () => {
            const canvas = canvasRef.current;
            if (!canvas) {
                return false;
            }

            const context = canvas.getContext('2d');
            if (!context) {
                return false;
            }

            const cssWidth = canvas.clientWidth;
            const cssHeight = canvas.clientHeight;
            if (cssWidth < 1 || cssHeight < 1) {
                return false;
            }

            const dpr = window.devicePixelRatio || 1;
            const nextWidth = Math.floor(cssWidth * dpr);
            const nextHeight = Math.floor(cssHeight * dpr);

            if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
                canvas.width = nextWidth;
                canvas.height = nextHeight;
            }

            context.setTransform(1, 0, 0, 1, 0, 0);
            context.scale(dpr, dpr);

            context.clearRect(0, 0, cssWidth, cssHeight);

            const isMobile = cssWidth < 640;
            const bars = isMobile
                ? Math.min(32, Math.max(18, Math.floor(cssWidth / 16)))
                : Math.min(52, Math.max(28, Math.floor(cssWidth / 12)));
            const gap = Math.max(2, Math.floor(cssWidth / 180));
            const barWidth = (cssWidth - gap * (bars - 1)) / bars;
            const hasSignalData = Boolean(analyser);
            const shouldRenderIdle = !hasSignalData || !isPlaying;
            const nyquist = hasSignalData
                ? ((analyser.context as AudioContext).sampleRate || 44100) / 2
                : 22050;
            const minFreq = 20;

            let bufferLength = 0;
            let dataArray: Uint8Array<ArrayBuffer> | null = null;
            if (hasSignalData) {
                bufferLength = analyser.frequencyBinCount;
                if (!dataArrayRef.current || dataArrayRef.current.length !== bufferLength) {
                    dataArrayRef.current = new Uint8Array(new ArrayBuffer(bufferLength));
                }
                dataArray = dataArrayRef.current;
                analyser.getByteFrequencyData(dataArray);
            }

            const isDarkMode = document.documentElement.classList.contains('dark');

            context.fillStyle = isDarkMode ? 'rgba(246, 244, 240, 0.1)' : 'rgba(59, 58, 53, 0.08)';

            for (let i = 0; i < bars; i += 1) {
                const x = i * (barWidth + gap);
                context.beginPath();
                context.roundRect(x, 0, barWidth, cssHeight, 999);
                context.fill();
            }

            if (shouldRenderIdle) {
                return true;
            }

            const visualizerColor = isDarkMode && activeTrackId === 'raw' ? '#f6f4f0' : activeColor;
            const gradient = context.createLinearGradient(0, cssHeight, 0, 0);
            gradient.addColorStop(0, visualizerColor);
            gradient.addColorStop(1, `${visualizerColor}66`);
            context.fillStyle = gradient;

            for (let i = 0; i < bars; i += 1) {
                let normalized = 0;

                if (dataArray && bufferLength > 0) {
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
                        Math.min(
                            bufferLength - 1,
                            Math.ceil((endFreq / nyquist) * (bufferLength - 1)),
                        ),
                    );

                    let sum = 0;
                    let count = 0;
                    for (let index = startIndex; index <= endIndex; index += 1) {
                        sum += dataArray[index];
                        count += 1;
                    }

                    normalized = count > 0 ? sum / count / 255 : 0;
                }

                const barHeight = Math.max(6, Math.pow(normalized, 0.82) * cssHeight);
                const x = i * (barWidth + gap);
                const y = cssHeight - barHeight;

                context.beginPath();
                context.roundRect(x, y, barWidth, barHeight, 999);
                context.fill();
            }

            return true;
        };

        // Idle: paint the resting bars once and then stay off the main thread
        // completely. A permanently scheduled rAF loop here would keep the page
        // from ever reaching an idle state (it wrecked TTI and Speed Index).
        if (!isPlaying) {
            paint();

            const canvas = canvasRef.current;
            const resizeObserver = new ResizeObserver(() => {
                paint();
            });
            if (canvas) {
                resizeObserver.observe(canvas);
            }

            // Repaint when the theme flips, since the resting bar colour depends
            // on the `dark` class rather than on any React state.
            const themeObserver = new MutationObserver(() => {
                paint();
            });
            themeObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'],
            });

            return () => {
                resizeObserver.disconnect();
                themeObserver.disconnect();
            };
        }

        const loop = (timestamp: number) => {
            if (timestamp - lastFrameRef.current >= PLAYING_FRAME_INTERVAL) {
                lastFrameRef.current = timestamp;
                paint();
                onTimelineTick();
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [activeColor, activeTrackId, analyser, canvasRef, isPlaying, onTimelineTick]);
}
