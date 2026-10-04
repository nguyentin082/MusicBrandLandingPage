import 'server-only';

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side checks for Sveltia CMS users. The CMS signs in with GitHub, so a
 * request is trusted when it carries a GitHub token with push access to the
 * content repo.
 */

const REPO = process.env.CMS_GITHUB_REPO ?? 'nguyentin082/MusicBrandLandingPage';
const AUTH_CACHE_MS = 5 * 60 * 1000;

// Per-instance cache so each call does not also cost a GitHub API call.
const authCache = new Map<string, { ok: boolean; expires: number }>();

export const cmsError = (status: number, message: string) =>
    NextResponse.json({ error: { message } }, { status });

const canEditRepo = async (token: string) => {
    const key = createHash('sha256').update(token).digest('hex');
    const cached = authCache.get(key);
    if (cached && cached.expires > Date.now()) return cached.ok;

    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': '2lab-cms',
        },
        cache: 'no-store',
    });
    const ok = res.ok && (await res.json()).permissions?.push === true;
    authCache.set(key, { ok, expires: Date.now() + AUTH_CACHE_MS });
    return ok;
};

/** Returns an error response for requests that are not from a CMS editor, else null. */
export const authorizeCmsRequest = async (req: NextRequest) => {
    // "Work with Local Repository" has no GitHub token; allow it on `next dev` only.
    if (process.env.NODE_ENV === 'development') return null;

    const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return cmsError(401, 'Chưa đăng nhập CMS. · Not signed in to the CMS.');
    if (!(await canEditRepo(token)))
        return cmsError(
            403,
            'Tài khoản không có quyền sửa repo nội dung. · This account cannot edit the content repo.',
        );
    return null;
};

/*
 * Draft preview session: a short-lived cookie handed to CMS editors, so the
 * "View on Live Site" button in the CMS opens drafts without a token in the URL.
 * Value is `<expiry ms>.<HMAC of expiry>`, keyed with PREVIEW_TOKEN.
 */

export const PREVIEW_COOKIE = 'cms_preview';
export const PREVIEW_SESSION_SECONDS = 12 * 60 * 60;

const sign = (value: string, secret: string) =>
    createHmac('sha256', secret).update(value).digest('base64url');

const safeEqual = (a: string, b: string) => {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
};

export const createPreviewSession = () => {
    const secret = process.env.PREVIEW_TOKEN;
    if (!secret) return null;
    const expires = String(Date.now() + PREVIEW_SESSION_SECONDS * 1000);
    return `${expires}.${sign(expires, secret)}`;
};

export const isValidPreviewSession = (cookie: string | undefined) => {
    const secret = process.env.PREVIEW_TOKEN;
    if (!secret || !cookie) return false;
    const [expires, signature = ''] = cookie.split('.');
    return Number(expires) > Date.now() && safeEqual(signature, sign(expires, secret));
};

export const isValidPreviewToken = (token: string | string[] | undefined) => {
    const secret = process.env.PREVIEW_TOKEN;
    return !!secret && typeof token === 'string' && safeEqual(token, secret);
};
