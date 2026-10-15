// GitHub Actions: progress commits and the final commit message.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';

const git = (...args) => execFileSync('git', args, { stdio: 'inherit' });

/**
 * In CI, commits and pushes one topic file right away, so editors see the
 * `writing` status in the CMS while the AI works. The workflow commits the
 * rest at the end. Pushes made with GITHUB_TOKEN do not start new workflow
 * runs, and Vercel skips builds for topic-only commits (vercel.json).
 */
export async function pushProgress(file, message) {
    const branch = process.env.GITHUB_REF_NAME;
    if (!process.env.GITHUB_ACTIONS || !branch) return;
    try {
        git('add', file);
        git('commit', '-m', message);
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                git('pull', '--rebase', 'origin', branch);
                git('push', 'origin', `HEAD:${branch}`);
                return;
            } catch {
                await new Promise((r) => setTimeout(r, 5_000));
            }
        }
        console.warn(`Could not push "${message}"; the final commit will include it.`);
    } catch (err) {
        console.warn(`Could not commit "${message}": ${err.message}`);
    }
}

/** Hands the workflow its final commit message (GITHUB_OUTPUT `commit_message`). */
export async function setCommitMessage(message) {
    if (process.env.GITHUB_OUTPUT)
        await fs.appendFile(process.env.GITHUB_OUTPUT, `commit_message=${message}\n`);
    console.log(message);
}
