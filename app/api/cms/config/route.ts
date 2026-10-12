import fs from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from 'yaml';

/**
 * Sveltia CMS config, served at /admin/config.yml (rewrite in next.config.mjs).
 * The repo and branch the CMS commits to come from the environment, so each
 * deployment edits its own branch: production edits `main`, a preview
 * deployment edits the branch it was built from, and local dev uses whatever
 * CMS_GITHUB_BRANCH says in .env.local.
 *
 * Built once at build time; changing the env vars needs a redeploy.
 */

export const dynamic = 'force-static';

const CONFIG_FILE = path.join(process.cwd(), 'cms/config.yml');

export async function GET() {
    const doc = parseDocument(await fs.readFile(CONFIG_FILE, 'utf8'));

    const repo = process.env.CMS_GITHUB_REPO;
    const branch = process.env.CMS_GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF;
    if (repo) doc.setIn(['backend', 'repo'], repo);
    if (branch) doc.setIn(['backend', 'branch'], branch);

    return new Response(doc.toString(), {
        headers: {
            'Content-Type': 'text/yaml; charset=utf-8',
            'X-Robots-Tag': 'noindex, nofollow',
        },
    });
}
