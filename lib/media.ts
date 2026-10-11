const NORMALIZED_ASSET_BASE_URL = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, '');

function isAbsoluteUrl(value: string) {
    return /^https?:\/\//i.test(value);
}

function normalizeRelativePath(path: string) {
    if (!path) {
        return path;
    }

    return path.startsWith('/') ? path : `/${path}`;
}

export function resolveMediaUrl(path?: string | null, fallback?: string) {
    const source = path ?? fallback ?? '';
    if (!source) {
        return source;
    }

    if (isAbsoluteUrl(source)) {
        return source;
    }

    if (!NORMALIZED_ASSET_BASE_URL) {
        return normalizeRelativePath(source);
    }

    return `${NORMALIZED_ASSET_BASE_URL}${normalizeRelativePath(source)}`;
}

export function toAbsoluteUrl(url: string, siteUrl: string) {
    if (isAbsoluteUrl(url)) {
        return url;
    }

    const normalizedSiteUrl = siteUrl.replace(/\/$/, '');
    const normalizedUrl = normalizeRelativePath(url);
    return `${normalizedSiteUrl}${normalizedUrl}`;
}

/*
 * Images pasted or dropped into the CMS are stored in posts as /uploads/<name>
 * (Sveltia's public_folder), but /admin uploads the file itself to R2 under
 * blog/<name> and never commits it (see public/admin/index.html and
 * app/api/cms/upload). This maps the stored path to the R2 URL.
 */
const CMS_UPLOADS_PATH = '/uploads/';
export const CMS_UPLOADS_R2_PREFIX = 'blog/';

export function resolveContentImage(src?: string) {
    if (!src?.startsWith(CMS_UPLOADS_PATH) || !NORMALIZED_ASSET_BASE_URL) {
        return src;
    }

    return `${NORMALIZED_ASSET_BASE_URL}/${CMS_UPLOADS_R2_PREFIX}${src.slice(CMS_UPLOADS_PATH.length)}`;
}
