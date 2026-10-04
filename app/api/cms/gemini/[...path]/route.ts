import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Gemini proxy for Sveltia CMS (public/admin). The browser never sees the API key:
 * /admin rewrites its Gemini calls to this route and sends the CMS user's GitHub
 * token instead. Only users with push access to the content repo get through.
 *
 * Allowed:
 *   GET  /api/cms/gemini/models                         (list models)
 *   POST /api/cms/gemini/models/<model>:generateContent (translate / generate)
 */

export const dynamic = 'force-dynamic';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const REPO = process.env.CMS_GITHUB_REPO ?? 'nguyentin082/MusicBrandLandingPage';
const MAX_BODY_BYTES = 1_000_000;
const AUTH_CACHE_MS = 5 * 60 * 1000;
const GENERATE_PATH = /^models\/[\w.-]+:generateContent$/;

// Per-instance cache so each Gemini call does not also cost a GitHub API call.
const authCache = new Map<string, { ok: boolean; expires: number }>();

const error = (status: number, message: string) =>
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

const authorize = async (req: NextRequest) => {
    // "Work with Local Repository" has no GitHub token; allow it on `next dev` only.
    if (process.env.NODE_ENV === 'development') return null;

    const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return error(401, 'Chưa đăng nhập CMS. · Not signed in to the CMS.');
    if (!(await canEditRepo(token)))
        return error(
            403,
            'Tài khoản không có quyền sửa repo nội dung. · This account cannot edit the content repo.',
        );
    return null;
};

const forward = async (url: string, init: RequestInit) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
        return error(
            500,
            'Server chưa cấu hình GEMINI_API_KEY. · GEMINI_API_KEY is not set on the server.',
        );

    const res = await fetch(url, {
        ...init,
        headers: { ...init.headers, 'x-goog-api-key': apiKey },
        cache: 'no-store',
    });
    return new NextResponse(res.body, {
        status: res.status,
        headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
    });
};

type Context = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: Context) {
    const path = (await params).path.join('/');
    if (path !== 'models') return error(404, 'Not found');

    const denied = await authorize(req);
    if (denied) return denied;

    const query = new URLSearchParams();
    for (const name of ['pageSize', 'pageToken']) {
        const value = req.nextUrl.searchParams.get(name);
        if (value) query.set(name, value);
    }
    return forward(`${GEMINI_BASE}/models?${query}`, { method: 'GET' });
}

export async function POST(req: NextRequest, { params }: Context) {
    const path = (await params).path.join('/');
    if (!GENERATE_PATH.test(path)) return error(404, 'Not found');

    const denied = await authorize(req);
    if (denied) return denied;

    const body = await req.text();
    if (Buffer.byteLength(body) > MAX_BODY_BYTES)
        return error(413, 'Nội dung quá dài. · Content is too long.');

    return forward(`${GEMINI_BASE}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
    });
}
