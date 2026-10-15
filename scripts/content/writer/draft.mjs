// The writing steps: scope check -> outline (vi) -> write (vi) -> self-review
// (vi) -> rewrite for English readers -> social posts.

import { SITE_URL } from './config.mjs';
import { gemini } from './gemini.mjs';
import { bullets, systemPrompt, template } from './prompts.mjs';
import { SCHEMAS } from './schemas.mjs';

/**
 * Returns `{ vi, en, social, flags }`, where vi and en are
 * `{ title, description, tags, body }`. `existing` is the post being rewritten.
 * `progress` is the topic's Telegram card (./telegram.mjs).
 */
export async function draftPost({ model, settings, topic, slug, existing, progress }) {
    const sysVi = systemPrompt(settings, 'vi');
    const sysEn = systemPrompt(settings, 'en');
    const request = template('request', {
        title: topic.title,
        keywordVi: topic.keywordVi,
        notes: topic.notes,
    });

    // Before writing: what does the topic ask us to claim that the facts do not
    // back? The writer is told not to claim it, and the reviewer gets a flag.
    const scope = await gemini({
        model,
        system: sysVi,
        temperature: 0.1,
        prompt: template('scope', { request, feedback: topic.feedback }),
        schema: SCHEMAS.scope,
    });
    const unsupported = scope.unsupported ?? [];
    const brief = template('brief', { request, unsupported: bullets(unsupported) });
    const rewrite =
        existing && topic.feedback
            ? template('rewrite', { feedback: topic.feedback, oldBody: existing.vi.content })
            : '';

    progress.step('outline');
    const outline = await gemini({
        model,
        system: sysVi,
        prompt: template('outline', { brief, rewrite }),
        schema: SCHEMAS.outline,
    });

    progress.step('writeVi');
    const draft = await gemini({
        model,
        system: sysVi,
        prompt: template('write', { brief, rewrite, outline: JSON.stringify(outline, null, 2) }),
        schema: SCHEMAS.write,
    });

    progress.step('reviewVi');
    const reviewed = await gemini({
        model,
        system: sysVi,
        temperature: 0.3,
        prompt: template('review', { brief, body: draft.body }),
        schema: SCHEMAS.review,
    });

    progress.step('writeEn');
    const en = await gemini({
        model,
        system: sysEn,
        prompt: template('english', {
            title: topic.title,
            keyword: topic.keywordEn || topic.keywordVi,
            feedback: existing ? topic.feedback : '',
            body: reviewed.body,
        }),
        schema: SCHEMAS.english,
    });

    progress.step('social');
    const social = await gemini({
        model,
        system: sysVi,
        prompt: template('social', {
            url: `${SITE_URL}/vi/blog/${slug}`,
            title: outline.title,
            body: reviewed.body,
        }),
        schema: SCHEMAS.social,
    });

    return {
        vi: {
            title: outline.title,
            description: outline.description,
            tags: outline.tags,
            body: reviewed.body,
        },
        en: { title: en.title, description: en.description, tags: en.tags, body: en.body },
        social,
        flags: [
            ...unsupported.map(
                (x) =>
                    `Chủ đề nhắc tới "${x}" nhưng Thông tin studio không có, nên AI không viết rằng 2lab làm điều này. Nếu 2lab có làm, thêm vào Cài đặt AI → Thông tin studio rồi chọn "Cần viết lại".`,
            ),
            ...(reviewed.flags ?? []),
        ],
    };
}
