/**
 * Label for the current deployment, or null on production.
 *
 * Decided by the environment Vercel builds with, not by code in a branch, so
 * the badge code can be merged into main and simply renders nothing there.
 *   - production (2lab.vn):            null
 *   - `staging` branch (staging.2lab.vn): "STAGING"
 *   - any other Vercel preview:        "PREVIEW · <branch>"
 *   - outside Vercel (npm run dev):    "LOCAL"
 */
export function getDeployLabel(): string | null {
    const env = process.env.VERCEL_ENV;
    const branch = process.env.VERCEL_GIT_COMMIT_REF;

    if (env === 'production') return null;
    if (branch === 'staging') return 'STAGING';
    if (env === 'preview') return branch ? `PREVIEW · ${branch}` : 'PREVIEW';
    return 'LOCAL';
}
