export function formatTime(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return '0:00';
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${mins}:${secs}`;
}

export function getTrackColor(trackId?: string) {
    if (trackId === 'master') {
        return '#ad3f2a';
    }

    if (trackId === 'vocal') {
        return '#e4b165';
    }

    return '#3b3a35';
}
