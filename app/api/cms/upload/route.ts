import { AwsClient } from 'aws4fetch';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeCmsRequest, cmsError } from '@/lib/cms-auth';
import { CMS_UPLOADS_R2_PREFIX } from '@/lib/media';

/**
 * Upload slot on R2 for images pasted or dropped into the CMS.
 *
 * Sveltia saves such images under public/uploads/ in the commit. /admin
 * (public/admin/index.html) takes them out of the commit, asks this route for a
 * presigned PUT URL, uploads the file straight from the browser (no Vercel body
 * size limit), rewrites /uploads/<name> in the posts to the full R2 URL and
 * only then lets the commit through. The site also maps any leftover
 * /uploads/<name> to R2 (lib/media.ts).
 *
 * POST { name, type, size } with the CMS user's GitHub token (Bearer).
 * 200 { uploadUrl, publicUrl } or { exists: true, publicUrl } when the same
 * file is already there; 409 when another file has that name.
 *
 * Env: R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
 * (an R2 API token with Object Read & Write on the bucket only), and
 * NEXT_PUBLIC_ASSET_BASE_URL for the public URL.
 */

export const dynamic = 'force-dynamic';

const MAX_BYTES = 20 * 1024 * 1024;
const URL_TTL_SECONDS = 300;
// One path segment, no control characters: Sveltia's file names, as committed.
const SAFE_NAME = /^(?!\.)[^/\\\x00-\x1f]{1,200}$/;

/** GET: the public URL prefix of CMS uploads, used by /admin to write full R2 URLs into posts. */
export async function GET(req: NextRequest) {
    const denied = await authorizeCmsRequest(req);
    if (denied) return denied;

    const assetBase = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, '');
    if (!assetBase) return cmsError(500, 'NEXT_PUBLIC_ASSET_BASE_URL is not set.');
    return NextResponse.json({ publicBase: `${assetBase}/${CMS_UPLOADS_R2_PREFIX}` });
}

export async function POST(req: NextRequest) {
    const denied = await authorizeCmsRequest(req);
    if (denied) return denied;

    const { R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
    const assetBase = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, '');
    if (!R2_ACCOUNT_ID || !R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !assetBase)
        return cmsError(
            500,
            'Server chưa cấu hình R2 (R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY). · R2 is not configured on the server.',
        );

    let body: { name?: unknown; type?: unknown; size?: unknown };
    try {
        body = await req.json();
    } catch {
        return cmsError(400, 'Invalid JSON');
    }
    const { name, type, size } = body;
    if (typeof name !== 'string' || !SAFE_NAME.test(name))
        return cmsError(400, `Tên file không hợp lệ. · Invalid file name: ${String(name)}`);
    if (typeof type !== 'string' || !type.startsWith('image/'))
        return cmsError(400, 'Chỉ nhận file ảnh. · Only images can be uploaded.');
    if (typeof size !== 'number' || size <= 0 || size > MAX_BYTES)
        return cmsError(413, 'Ảnh quá lớn (tối đa 20 MB). · Image is too large (max 20 MB).');

    const key = `${CMS_UPLOADS_R2_PREFIX}${name}`;
    const objectUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`;
    const publicUrl = `${assetBase}/${key.split('/').map(encodeURIComponent).join('/')}`;
    const r2 = new AwsClient({
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
        service: 's3',
        region: 'auto',
    });

    // Never overwrite a different image that already has this name: another post
    // may use it. The same file again (same size) is fine.
    const head = await r2.fetch(objectUrl, { method: 'HEAD' });
    if (head.ok) {
        if (Number(head.headers.get('content-length')) === size)
            return NextResponse.json({ exists: true, publicUrl });
        return cmsError(
            409,
            `Đã có ảnh khác tên "${name}" trên R2. Đổi tên file rồi thử lại. · Another image named "${name}" is already on R2; rename the file.`,
        );
    }
    if (head.status !== 404) return cmsError(502, `R2 HEAD ${head.status}`);

    const signed = await r2.sign(`${objectUrl}?X-Amz-Expires=${URL_TTL_SECONDS}`, {
        method: 'PUT',
        aws: { signQuery: true },
    });
    return NextResponse.json({ uploadUrl: signed.url, publicUrl });
}
