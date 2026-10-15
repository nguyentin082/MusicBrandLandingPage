// AI writer for 2lab blog posts, run by .github/workflows/write-post.yml.
// Writes each `queued` or `rewrite` topic (only TOPIC_SLUG when set) to
// content/blog/{vi,en}/<slug>.mdx as a draft and moves the topic to `review`.
// `--recover` moves topics stuck in `writing` out of it after a failed run.
// Steps are in ./writer, prompts in ./prompts. Each topic gets a Telegram card
// that follows the steps (./writer/telegram.mjs).
//
// Env: GEMINI_API_KEY (required), GEMINI_MODEL, TOPIC_SLUG, SITE_URL,
//      TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID, PREVIEW_TOKEN, GITHUB_OUTPUT.

import { pushProgress, setCommitMessage } from './writer/ci.mjs';
import { loadSettings } from './writer/config.mjs';
import { draftPost } from './writer/draft.mjs';
import {
    listTopics,
    pickSlug,
    postExists,
    readExistingPost,
    readTopic,
    today,
    updateTopic,
    writePostFiles,
} from './writer/files.mjs';
import { cleanBody, finishPost } from './writer/finish.mjs';
import { setWaitListener } from './writer/gemini.mjs';
import { enforceNoPrices } from './writer/prices.mjs';
import { enforceStudioFacts } from './writer/studio-facts.mjs';
import { deliver, openCards, recordResult } from './writer/telegram.mjs';

/** Writes the post files for one topic; returns the post. Throws with a message for the AI log. */
async function writeTopic({ model, settings, topic, slug, progress }) {
    if (!topic.title || !topic.keywordVi)
        throw new Error('Chủ đề cần có tiêu đề và từ khóa tiếng Việt.');

    const existing = await readExistingPost(slug);
    if (existing && existing.vi.data.draft !== true) {
        throw new Error(
            `Bài ${slug} đang xuất bản. AI không viết đè bài đã xuất bản; hãy tick "Bản nháp" cho bài rồi chọn lại "Cần viết lại".`,
        );
    }

    const post = await draftPost({ model, settings, topic, slug, existing, progress });
    post.vi.body = cleanBody(post.vi.body);
    post.en.body = cleanBody(post.en.body);

    progress.step('checks');
    await enforceStudioFacts({ model, settings, post, progress });
    await enforceNoPrices({ model, settings, post, progress });

    progress.step('save');
    finishPost(post);

    await writePostFiles({ slug, post, existing });
    return post;
}

/** After a failed or cancelled run: no topic should stay in `writing`. */
async function recover() {
    const stuck = [];
    for (const { slug, file } of await listTopics()) {
        const topic = await readTopic(file);
        if (topic.status !== 'writing') continue;
        const hasPost = topic.postSlug && (await postExists('vi', topic.postSlug));
        const status = hasPost ? 'review' : 'idea';
        await updateTopic(file, {
            status,
            aiLog: `${today()}: lỗi: Action bị dừng giữa chừng (xem tab Actions trên GitHub). Chọn lại "${hasPost ? 'Cần viết lại' : 'Chờ viết'}" để thử lại.`,
        });
        await recordResult(slug, { type: 'stopped', status });
        stuck.push(slug);
    }
    await setCommitMessage(
        `content(ai): ${stuck.length ? `recover ${stuck.join(', ')}` : 'nothing to recover'}`,
    );
}

export async function main() {
    if (process.argv.includes('--recover')) return recover();
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

    const { settings, model } = await loadSettings();
    const only = process.env.TOPIC_SLUG?.trim();

    // Read every queued topic first, so each card can show its place in line.
    const queue = [];
    for (const { slug: topicSlug, file } of await listTopics()) {
        if (only && topicSlug !== only) continue;
        const topic = await readTopic(file);
        if (['queued', 'rewrite'].includes(topic.status))
            queue.push({ topicSlug, file, title: topic.title || topicSlug, mode: topic.status });
    }
    const cards = await openCards(
        queue.map(({ topicSlug, title, mode }) => ({ topicSlug, title, mode })),
        model,
    );

    const done = [];
    const failed = [];
    for (const { topicSlug, file } of queue) {
        const card = cards.get(topicSlug);
        // Read again: a progress push (git pull --rebase) may have changed it.
        const topic = await readTopic(file);
        if (!['queued', 'rewrite'].includes(topic.status)) {
            await card.finish({ type: 'skipped' });
            continue;
        }

        console.log(`Topic ${topicSlug} (${topic.status}), model ${model}`);
        const slug = await pickSlug(topicSlug, topic);
        await updateTopic(file, {
            status: 'writing',
            aiLog: `${today()}: AI đang viết bằng ${model}...`,
        });
        card.start(model);
        setWaitListener((text) => card.note(text));
        await pushProgress(file, `content(ai): writing ${topicSlug}`);
        try {
            const post = await writeTopic({ model, settings, topic, slug, progress: card });
            await updateTopic(file, {
                status: 'review',
                postSlug: slug,
                aiLog: `${today()}: đã viết ${slug} bằng ${model}${post.flags.length ? `, ${post.flags.length} cảnh báo` : ''}.`,
            });
            done.push(slug);
            await card.finish({ type: 'done', slug, flags: post.flags.length });
            console.log(`  wrote content/blog/{vi,en}/${slug}.mdx`);
        } catch (err) {
            console.error(`  failed: ${err.message}`);
            failed.push({ topicSlug, message: err.message });
            // Out of the queue so the next topic save does not retry it in a loop.
            const status = topic.status === 'rewrite' ? 'review' : 'idea';
            await updateTopic(file, { status, aiLog: `${today()}: lỗi: ${err.message}` });
            await card.finish({ type: 'failed', status, message: err.message });
        }
    }
    setWaitListener(() => {});

    // In Actions, the workflow reports after it pushes the commit, so links in
    // the reply already open the new draft.
    if (!process.env.GITHUB_ACTIONS) await deliver();

    const parts = [
        done.length && `draft ${done.join(', ')}`,
        failed.length && `failed ${failed.map((f) => f.topicSlug).join(', ')}`,
    ];
    await setCommitMessage(
        `content(ai): ${parts.filter(Boolean).join('; ') || 'no queued topics'}`,
    );
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
