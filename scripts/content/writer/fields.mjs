// A post's text fields by name, and a model call that rewrites some of them.
// Used by the studio-facts and price checks.

import { OBJ, S, gemini } from './gemini.mjs';
import { systemPrompt, template } from './prompts.mjs';

/** Every text field of a post, keyed by where it goes (`vi.body`, `social.zalo`...). */
export function textFields(post) {
    return {
        'vi.title': post.vi.title,
        'vi.description': post.vi.description,
        'vi.tags': post.vi.tags.join(', '),
        'vi.body': post.vi.body,
        'en.title': post.en.title,
        'en.description': post.en.description,
        'en.tags': post.en.tags.join(', '),
        'en.body': post.en.body,
        ...Object.fromEntries(Object.entries(post.social).map(([k, v]) => [`social.${k}`, v])),
    };
}

// Field names go to Gemini as JSON schema keys, so use `vi_body`, not `vi.body`.
export const toKey = (field) => field.replace('.', '_');
export const fromKey = (key) => key.replace('_', '.');

/** Asks the model once to rewrite the given fields of the post, in place. */
export async function fixFields({ model, settings, post, fields, instruction }) {
    const all = textFields(post);
    const input = Object.fromEntries(
        [...new Set(fields)].filter((f) => f in all).map((f) => [toKey(f), all[f]]),
    );
    if (!Object.keys(input).length) return;

    const fixed = await gemini({
        model,
        system: systemPrompt(settings, 'vi'),
        temperature: 0.2,
        prompt: template('fix-fields', { instruction, fields: JSON.stringify(input, null, 2) }),
        schema: OBJ(Object.fromEntries(Object.keys(input).map((k) => [k, S('Văn bản đã sửa')]))),
    });

    for (const [key, text] of Object.entries(fixed)) {
        const [group, name] = fromKey(key).split('.');
        const target = group === 'social' ? post.social : post[group];
        if (!target || !(name in target)) continue;
        target[name] =
            name === 'tags'
                ? text
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                : text;
    }
}
