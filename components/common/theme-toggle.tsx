'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-10 h-10" />;
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
            style={{
                touchAction: 'manipulation',
            }}
        >
            {isDark ? (
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-warm-gold" />
            ) : (
                <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-brick-red" />
            )}
        </button>
    );
}
