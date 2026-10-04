'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BlogPreviewCopy } from '@/lib/blog-i18n';

/**
 * Shown on the draft preview route when the browser has no preview cookie yet.
 * /admin runs on the same origin, so the GitHub token Sveltia stored at sign-in
 * is readable here. Trade it for a preview cookie, then reload the page.
 */

const readCmsToken = () => {
    try {
        return JSON.parse(localStorage.getItem('sveltia-cms.user') || '{}')?.token as
            | string
            | undefined;
    } catch {
        return undefined;
    }
};

export function PreviewSignIn({ copy }: { copy: BlogPreviewCopy }) {
    const router = useRouter();
    const [status, setStatus] = useState<'checking' | 'denied'>('checking');

    useEffect(() => {
        const token = readCmsToken();
        fetch('/api/cms/preview-session', {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((res) => (res.ok ? router.refresh() : setStatus('denied')))
            .catch(() => setStatus('denied'));
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-off-white px-6 text-center text-dark-umber dark:bg-dark-umber dark:text-off-white">
            {status === 'checking' ? (
                <p>{copy.checking}</p>
            ) : (
                <div className="max-w-md space-y-3">
                    <p className="font-semibold">{copy.deniedTitle}</p>
                    <p className="text-sm opacity-80">
                        {copy.deniedBefore}{' '}
                        <a href="/admin" className="underline">
                            {copy.deniedLink}
                        </a>
                        {copy.deniedAfter}
                    </p>
                </div>
            )}
        </main>
    );
}
