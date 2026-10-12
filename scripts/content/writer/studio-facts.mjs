// What the post says about 2lab must come from the studio facts
// (Cài đặt AI → Thông tin studio).

import { fixFields, fromKey, textFields, toKey } from './fields.mjs';
import { gemini } from './gemini.mjs';
import { bullets, systemPrompt, template } from './prompts.mjs';
import { SCHEMAS } from './schemas.mjs';

/** Claims about 2lab in the post that the studio facts do not back. */
async function unsupportedClaims({ model, settings, post }) {
    const fields = Object.fromEntries(
        Object.entries(textFields(post))
            .filter(([field]) => !field.endsWith('.tags'))
            .map(([field, text]) => [toKey(field), text]),
    );
    const { claims = [] } = await gemini({
        model,
        system: systemPrompt(settings, 'vi'),
        temperature: 0.1,
        prompt: template('facts-check', {
            studioFacts: bullets(settings.studioFacts),
            fields: JSON.stringify(fields, null, 2),
        }),
        schema: SCHEMAS.facts,
    });
    return claims
        .map(({ field, claim }) => ({ field: fromKey(String(field)), claim }))
        .filter(({ claim }) => claim);
}

/** Checks the post against the studio facts, fixes once, and flags what is left. */
export async function enforceStudioFacts({ model, settings, post }) {
    let claims = await unsupportedClaims({ model, settings, post });
    if (!claims.length) return;

    console.log(`  removing ${claims.length} claim(s) not in the studio facts`);
    await fixFields({
        model,
        settings,
        post,
        fields: claims.map((c) => c.field),
        instruction: template('fix-facts', { claims: bullets(claims.map((c) => c.claim)) }),
    });

    claims = await unsupportedClaims({ model, settings, post });
    for (const { field, claim } of claims) {
        post.flags.push(
            `❗ Có thể chưa đúng Thông tin studio (${field}): "${claim}". Kiểm tra trước khi xuất bản.`,
        );
    }
}
