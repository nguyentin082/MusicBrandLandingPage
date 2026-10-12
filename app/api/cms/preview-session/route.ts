import { NextRequest, NextResponse } from 'next/server';
import {
    authorizeCmsRequest,
    cmsError,
    createPreviewSession,
    PREVIEW_COOKIE,
    PREVIEW_SESSION_SECONDS,
} from '@/lib/cms-auth';

/**
 * POST with the CMS user's GitHub token (Authorization: Bearer) to get a
 * short-lived cookie that lets this browser open /<lang>/blog/preview/<slug>.
 * Called by the preview page itself, which reads the token Sveltia stores.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const denied = await authorizeCmsRequest(req);
    if (denied) return denied;

    const session = createPreviewSession();
    if (!session)
        return cmsError(
            500,
            'Server chưa cấu hình PREVIEW_TOKEN. · PREVIEW_TOKEN is not set on the server.',
        );

    const res = NextResponse.json({ ok: true });
    res.cookies.set(PREVIEW_COOKIE, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: PREVIEW_SESSION_SECONDS,
    });
    return res;
}
