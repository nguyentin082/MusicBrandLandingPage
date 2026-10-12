// Prompt templates live in ../prompts (see its README.md). The price and
// studio-facts policies are there too, not in content/settings/ai.yml, so
// editing the settings in the CMS cannot remove them.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROMPTS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../prompts');
const templates = new Map();

/** Fills prompts/<name>.md: `{{key}}` values and `{{#key}}...{{/key}}` blocks kept when key is set. */
export function template(name, vars = {}) {
    if (!templates.has(name)) {
        const text = readFileSync(path.join(PROMPTS_DIR, `${name}.md`), 'utf8');
        templates.set(name, text.replace(/<!--[\s\S]*?-->\n?/g, '').trim());
    }
    const value = (key) => {
        if (!(key in vars)) throw new Error(`prompts/${name}.md: no value for {{${key}}}`);
        return vars[key];
    };
    return templates
        .get(name)
        .replace(/^\{\{#(\w+)\}\}\n([\s\S]*?)^\{\{\/\1\}\}(?:\n|$)/gm, (_, key, body) =>
            value(key) ? body : '',
        )
        .replace(/\{\{(\w+)\}\}/g, (_, key) => String(value(key) ?? ''))
        .trim();
}

/** ["a", "b"] -> "- a\n- b". */
export const bullets = (items) => (items ?? []).map((x) => `- ${x}`).join('\n');

/** The system instruction for every call, from the CMS settings. */
export function systemPrompt(settings, lang) {
    return template('system', {
        language: template(`language-${lang}`),
        voice: settings.voice,
        audience: settings.audience,
        rules: bullets(settings.rules),
        glossary: bullets(
            (settings.glossary ?? []).map(
                (g) => `${g.vi} ↔ ${g.en}${g.note ? ` (${g.note})` : ''}`,
            ),
        ),
        studioFacts: bullets(settings.studioFacts),
        bannedClaims: bullets(settings.bannedClaims),
        factsPolicy: template('facts-policy'),
        pricePolicy: template('price-policy'),
    });
}
