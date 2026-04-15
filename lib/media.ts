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
