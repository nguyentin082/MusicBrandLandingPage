import { getDeployLabel } from '@/lib/deploy-env';

/**
 * Marks non-production deployments (staging, previews, local dev) with a
 * stripe across the top of the page and a tab under it. Renders nothing on
 * production. Clicks pass through, so it never blocks the header.
 */
export function EnvironmentBadge() {
    const label = getDeployLabel();
    if (!label) return null;

    return (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center">
            <div className="h-1 w-full bg-amber-400" />
            <div className="rounded-b-md bg-amber-400 px-3 py-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-black shadow-lg">
                {label}
            </div>
        </div>
    );
}
