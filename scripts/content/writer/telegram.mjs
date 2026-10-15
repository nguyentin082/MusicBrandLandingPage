// Telegram progress for the AI writer: one card (message) per topic.
//   announce        workflow step before `npm ci`: "received" cards for the
//                   queued topics, seconds after the editor saves.
//   write-post.mjs  edits the card at each step. Edits are silent.
//   deliver         last workflow step, after the commit is pushed: settles each
//                   card and replies to it, so the chat pings with links that
//                   already open the new draft.
// Dependency-free so `announce` runs before `npm ci`. Telegram errors are logged
// and never fail the writer.
//
// Env: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (no-op without them), SITE_URL,
//      PREVIEW_TOKEN, TOPIC_SLUG, COMMIT_OUTCOME (deliver: the commit step's
//      outcome), and RUNNER_TEMP + GITHUB_* (set by Actions).

import fs from 'node:fs/promises';
import path from 'node:path';

const TOPICS_DIR = path.join(process.cwd(), 'content/topics');
// Same as config.mjs, which this file cannot import (it needs `yaml`).
const SITE_URL = (process.env.SITE_URL || 'https://2lab.vn').replace(/\/$/, '');

export const STEPS = [
    ['received', 'Nhận yêu cầu'],
    ['scope', 'Kiểm tra phạm vi chủ đề'],
    ['outline', 'Lập dàn ý'],
    ['writeVi', 'Viết bản tiếng Việt'],
    ['reviewVi', 'Tự kiểm tra bản tiếng Việt'],
    ['writeEn', 'Viết bản tiếng Anh'],
    ['social', 'Viết bài mạng xã hội'],
    ['checks', 'Đối chiếu thông tin studio và giá'],
    ['save', 'Lưu bản nháp'],
];
const STEP_KEYS = STEPS.map(([key]) => key);

// Where to put the topic back, by status the writer or recover left it in.
const RETRY_HINT = {
    idea: 'Chủ đề đã về "💡 Ý tưởng". Sửa chủ đề rồi chọn lại "⏳ Chờ viết" để thử lại.',
    review: 'Bài cũ giữ nguyên, chủ đề về "Chờ duyệt". Chọn lại "Cần viết lại" để thử lại.',
    queued: 'Chủ đề vẫn ở "⏳ Chờ viết" và sẽ được viết ở lần Lưu chủ đề tiếp theo.',
    rewrite: 'Chủ đề vẫn ở "Cần viết lại" và sẽ được viết ở lần Lưu chủ đề tiếp theo.',
    writing:
        'Chủ đề có thể còn kẹt ở "✍️ AI đang viết". Chọn lại "⏳ Chờ viết" hoặc "Cần viết lại" để thử lại.',
};

// ---------------------------------------------------------------------------
// Formatting

const esc = (text) =>
    String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

function duration(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(s / 60);
    return m ? `${m} phút ${s % 60} giây` : `${s} giây`;
}

const bar = (fraction) => {
    const n = Math.round(fraction * 10);
    return '▓'.repeat(n) + '░'.repeat(10 - n);
};

const cmsUrl = (collection, slug) =>
    `${SITE_URL}/admin/#/collections/${collection}/entries/${slug}`;

// Reviewers open Telegram links without a CMS sign-in, so the preview link
// carries the site's PREVIEW_TOKEN (see app/[lang]/blog/preview).
function previewUrl(locale, slug) {
    const token = process.env.PREVIEW_TOKEN;
    return `${SITE_URL}/${locale}/blog/preview/${slug}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
}

function runUrl() {
    const { GITHUB_SERVER_URL: server, GITHUB_REPOSITORY: repo, GITHUB_RUN_ID: id } = process.env;
    return server && repo && id ? `${server}/${repo}/actions/runs/${id}` : null;
}

function meta(card) {
    return [
        card.mode === 'rewrite' ? 'Viết lại theo góp ý' : 'Viết mới',
        card.model,
        process.env.GITHUB_ACTOR && `yêu cầu bởi ${process.env.GITHUB_ACTOR}`,
        card.total > 1 && `chủ đề ${card.position}/${card.total}`,
    ]
        .filter(Boolean)
        .map(esc)
        .join(' · ');
}

/** The card's text for its current phase. */
function render(card) {
    const head = `<b>${esc(card.title)}</b>\n${meta(card)}`;
    const elapsed = card.startedAt ? duration((card.endedAt ?? Date.now()) - card.startedAt) : '';
    switch (card.phase) {
        case 'waiting':
            return `🕒 ${head}\n\nĐã nhận yêu cầu. ${
                card.position > 1
                    ? `Đang chờ viết xong ${card.position - 1} chủ đề trước.`
                    : 'Đang khởi động AI…'
            }`;
        case 'writing': {
            const at = STEP_KEYS.indexOf(card.step);
            const lines = STEPS.map(([, label], i) => {
                if (i < at) return `✅ ${label}`;
                if (i > at) return `▫️ ${label}`;
                return `⏳ <b>${label}…</b>${card.note ? `\n      <i>${esc(card.note)}</i>` : ''}`;
            });
            const done = at / STEPS.length;
            return `✍️ ${head}\n\n${lines.join('\n')}\n\n${bar(done)} ${Math.round(done * 100)}% · ${elapsed}`;
        }
        case 'saving':
            return `💾 ${head}\n\n${bar(1)} 100% · ${elapsed}\nĐang lưu lên GitHub…`;
        case 'done':
            return `✅ ${head}\n\nĐã viết xong trong ${elapsed}. Đang chờ duyệt.`;
        case 'failed':
            return `❌ ${head}\n\nKhông viết được: ${esc(card.result?.message)}`;
        case 'skipped':
            return `↩️ ${head}\n\nBỏ qua: trạng thái chủ đề đã được đổi trong lúc chờ.`;
        default:
            return `⛔ ${head}\n\nBị dừng giữa chừng.`;
    }
}

/** The reply that settles a card: text and URL buttons. */
function resultMessage(card) {
    const { result = { type: 'stopped' } } = card;
    const title = esc(card.title);
    const log = runUrl() && { text: '🔎 Xem log', url: runUrl() };
    const topicButton = { text: '📝 Mở chủ đề trong CMS', url: cmsUrl('topics', card.topicSlug) };

    if (result.type === 'done') {
        const flags = result.flags
            ? `\n⚠️ AI để lại ${result.flags} cảnh báo: mở bài, đọc mục "Cảnh báo của AI".`
            : '';
        return {
            text: `✅ <b>Đã viết xong: ${title}</b>\nBản nháp tiếng Việt và tiếng Anh đang chờ duyệt.${flags}\n\n<i>Bản xem trước có sau khi website build xong, khoảng 2–3 phút.</i>`,
            buttons: [
                [{ text: '📝 Duyệt trong CMS', url: cmsUrl('blog', result.slug) }],
                [
                    { text: '👀 Xem trước (VI)', url: previewUrl('vi', result.slug) },
                    { text: '👀 Preview (EN)', url: previewUrl('en', result.slug) },
                ],
            ],
        };
    }
    if (result.type === 'skipped') {
        return {
            text: `↩️ <b>Bỏ qua: ${title}</b>\nTrạng thái chủ đề đã được đổi trong lúc chờ, nên AI không viết.`,
            buttons: [[topicButton]],
        };
    }
    const hint = RETRY_HINT[result.status] ?? '';
    const text =
        result.type === 'failed'
            ? `❌ <b>Không viết được: ${title}</b>\n${esc(result.message)}`
            : `⛔ <b>Bị dừng giữa chừng: ${title}</b>\nAction gặp lỗi hoặc quá thời gian trước khi viết xong chủ đề này.`;
    return {
        text: `${text}${hint ? `\n\n${hint}` : ''}`,
        buttons: [[topicButton, log].filter(Boolean)],
    };
}

// ---------------------------------------------------------------------------
// Telegram Bot API

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Calls the Bot API; returns the result, or null on any error (logged). */
async function call(method, payload) {
    const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = process.env;
    if (!token || !chatId) return null;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    parse_mode: 'HTML',
                    link_preview_options: { is_disabled: true },
                    ...payload,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (data.ok) return data.result;
            // The heartbeat re-renders cards whose text did not change.
            if (/message is not modified/.test(data.description)) return null;
            if (res.status === 429 && attempt < 3) {
                await sleep((data.parameters?.retry_after ?? 3) * 1000);
                continue;
            }
            console.warn(`Telegram ${method}: ${res.status} ${data.description ?? ''}`);
            return null;
        } catch (err) {
            console.warn(`Telegram ${method}: ${err.message}`);
            if (attempt < 3) await sleep(2000);
        }
    }
    return null;
}

async function reply(messageId, { text, buttons }) {
    const sent = await call('sendMessage', {
        text,
        reply_parameters: messageId
            ? { message_id: messageId, allow_sending_without_reply: true }
            : undefined,
        reply_markup: { inline_keyboard: buttons },
    });
    if (sent) return;
    // Telegram rejects some button URLs (e.g. localhost); send them as text instead.
    const links = buttons.flat().map((b) => `${b.text}: ${b.url}`);
    await call('sendMessage', { text: `${text}\n\n${links.map(esc).join('\n')}` });
}

// ---------------------------------------------------------------------------
// Cards. The workflow's steps run as separate processes, so card state lives in
// a file under RUNNER_TEMP (per job). Outside Actions it stays in memory.

const STATE_FILE =
    process.env.RUNNER_TEMP && path.join(process.env.RUNNER_TEMP, 'ai-writer-telegram.json');
let state = null;

async function loadState() {
    if (state) return state;
    state = { cards: {} };
    if (STATE_FILE) {
        try {
            state = JSON.parse(await fs.readFile(STATE_FILE, 'utf8'));
        } catch {
            // First step of the job.
        }
    }
    return state;
}

async function saveState() {
    if (!STATE_FILE) return;
    try {
        await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (err) {
        console.warn(`Telegram state: ${err.message}`);
    }
}

class Card {
    constructor(data) {
        this.data = data;
        this.chain = Promise.resolve();
        this.queued = false;
        this.heartbeat = null;
    }

    /**
     * Applies changes and syncs the message; await to wait for it. Syncs run one
     * at a time, and changes made while one waits go out together in the next.
     */
    update(changes = {}) {
        Object.assign(this.data, changes);
        if (!this.queued) {
            this.queued = true;
            this.chain = this.chain.then(() => {
                this.queued = false;
                return this.sync();
            });
        }
        return this.chain;
    }

    async sync() {
        await saveState();
        const text = render(this.data);
        if (this.data.messageId) {
            await call('editMessageText', { message_id: this.data.messageId, text });
            return;
        }
        const sent = await call('sendMessage', { text });
        if (sent) {
            this.data.messageId = sent.message_id;
            await saveState();
        }
    }

    /** Starts the step list; the elapsed time refreshes while the AI works. */
    start(model) {
        console.log('  scope');
        this.heartbeat = setInterval(() => this.update(), 20_000);
        this.heartbeat.unref();
        return this.update({
            model,
            phase: 'writing',
            step: 'scope',
            note: '',
            startedAt: Date.now(),
        });
    }

    step(key) {
        console.log(`  ${key}`);
        return this.update({ step: key, note: '' });
    }

    /** A line under the current step, e.g. a retry wait. Empty clears it. */
    note(text) {
        if (text) console.log(`  ${text}`);
        return this.update({ note: text });
    }

    /** Records the outcome; `deliver` replies with it once the commit is pushed. */
    finish(result) {
        clearInterval(this.heartbeat);
        const phase = result.type === 'done' ? 'saving' : result.type;
        return this.update({ result, phase, note: '', endedAt: Date.now() });
    }
}

/**
 * Opens (or reuses, from `announce`) a card for each queued topic and shows it
 * as waiting. `topics`: `[{ topicSlug, title, mode }]` in writing order.
 * Returns the cards by topic slug.
 */
export async function openCards(topics, model) {
    await loadState();
    const cards = new Map();
    for (const [i, topic] of topics.entries()) {
        const data = (state.cards[topic.topicSlug] ??= { phase: 'waiting' });
        const card = new Card(data);
        await card.update({
            ...topic,
            model: model ?? data.model,
            position: i + 1,
            total: topics.length,
        });
        cards.set(topic.topicSlug, card);
    }
    return cards;
}

/** Sets a card's result without a live card, e.g. from `--recover`. */
export async function recordResult(topicSlug, result) {
    await loadState();
    const data = state.cards[topicSlug];
    if (!data) return;
    data.result = result;
    data.endedAt ??= Date.now();
    await saveState();
}

/** Settles every card: final text, and a reply that pings the chat. */
export async function deliver() {
    await loadState();
    const committed = (process.env.COMMIT_OUTCOME || 'success') === 'success';
    for (const data of Object.values(state.cards)) {
        if (data.delivered) continue;
        if (!data.result)
            data.result = {
                type: 'stopped',
                status: data.phase === 'waiting' ? data.mode : 'writing',
            };
        if (data.result.type === 'done' && !committed) {
            data.result = {
                type: 'failed',
                status: 'writing',
                message:
                    'AI đã viết xong nhưng không lưu được lên GitHub (có thể do xung đột với một lần Lưu khác).',
            };
        }
        const { type } = data.result;
        const card = new Card(data);
        await card.update({
            phase: type === 'done' ? 'done' : type === 'stopped' ? 'stopped' : 'failed',
        });
        await reply(data.messageId, resultMessage(data));
        data.delivered = true;
        await saveState();
    }
}

// ---------------------------------------------------------------------------
// announce: a quick read of the topic files, without the `yaml` package.

/** A top-level `key: value` from a topic file; enough for Sveltia's output. */
function yamlField(text, key) {
    const m = text.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'));
    if (!m) return '';
    const value = m[1].trim();
    if (value.startsWith('"')) {
        try {
            return JSON.parse(value);
        } catch {
            return value.slice(1, -1);
        }
    }
    if (value.startsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
    return value;
}

export async function announce() {
    const only = process.env.TOPIC_SLUG?.trim();
    const names = (await fs.readdir(TOPICS_DIR).catch(() => [])).filter((f) => f.endsWith('.yml'));
    const queued = [];
    for (const name of names) {
        const topicSlug = name.replace(/\.yml$/, '');
        if (only && topicSlug !== only) continue;
        const text = await fs.readFile(path.join(TOPICS_DIR, name), 'utf8');
        const mode = yamlField(text, 'status');
        if (mode === 'queued' || mode === 'rewrite')
            queued.push({ topicSlug, title: yamlField(text, 'title') || topicSlug, mode });
    }
    await openCards(queued);
    console.log(`Announced ${queued.length} topic(s).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];
    const run = { announce, deliver }[command];
    if (!run) {
        console.error('Usage: node scripts/content/writer/telegram.mjs announce|deliver');
        process.exit(1);
    }
    run().catch((err) => {
        // Never fail the workflow over a notification.
        console.warn(err);
    });
}
