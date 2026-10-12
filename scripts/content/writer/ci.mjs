// GitHub Actions and Telegram: progress commits, the final commit message and
// the notification.

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

export async function notify(lines) {
    const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = process.env;
    if (!token || !chatId || !lines.length) return;
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: lines.join('\n\n'),
            disable_web_page_preview: true,
        }),
    });
    if (!res.ok) console.warn(`Telegram: ${res.status} ${await res.text()}`);
}
