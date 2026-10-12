// Prices are never published. The prompts forbid them, and this scan is the
// check that does not depend on the model.

import { fixFields, textFields } from './fields.mjs';
import { template } from './prompts.mjs';

const CURRENCY = String.raw`(?:₫|đ|đồng|vn[dđ]|usd|đô|dollars?|euros?|€|£)`;
const PRICE_PATTERNS = [
    // 500.000đ, 2 triệu đồng, 300k VNĐ, 50 USD
    new RegExp(
        String.raw`\d[\d.,]*\s*(?:k|nghìn|ngàn|triệu|tr|tỷ)?\s*${CURRENCY}(?![\p{L}\p{N}])`,
        'iu',
    ),
    // $50, € 20
    /[$€£₫]\s*\d/u,
    // "giá 300k", "chi phí khoảng 5 triệu", "price from 100". Not "giá trị"
    // (value), "đánh giá" (rating), "giá đỡ" (stand) or "sample rate".
    new RegExp(
        String.raw`(?<![\p{L}])(?<!đánh\s)(?:giá(?!\s*(?:trị|đỡ))|chi phí|mức phí|học phí|phí dịch vụ|báo giá|price|pricing|cost|fee)s?[^.\n\d]{0,25}\d`,
        'iu',
    ),
];

/** Returns the snippets of `text` that look like a price. */
export function findPrices(text) {
    const found = [];
    // The brand name has a digit: "liên hệ 2lab để được báo giá" is not a price.
    for (const line of String(text ?? '')
        .replace(/2lab/gi, 'lab')
        .split('\n')) {
        for (const re of PRICE_PATTERNS) {
            const m = line.match(re);
            if (m)
                found.push(
                    line.slice(Math.max(0, m.index - 20), m.index + m[0].length + 20).trim(),
                );
        }
    }
    return found;
}

function priceHits(post) {
    return Object.entries(textFields(post))
        .map(([field, text]) => ({ field, hits: findPrices(text) }))
        .filter((x) => x.hits.length);
}

/** Asks the model once to remove prices; throws if any are left. */
export async function enforceNoPrices({ model, settings, post }) {
    let hits = priceHits(post);
    if (!hits.length) return;

    console.log(`  removing prices from ${hits.map((h) => h.field).join(', ')}`);
    await fixFields({
        model,
        settings,
        post,
        fields: hits.map((h) => h.field),
        instruction: template('fix-prices', {
            snippets: hits.flatMap((h) => h.hits).join(' | '),
        }),
    });
    hits = priceHits(post);
    if (hits.length) {
        throw new Error(
            `AI vẫn nhắc tới giá sau khi sửa (${hits.map((h) => `${h.field}: "${h.hits[0]}"`).join('; ')}). Không ghi bài.`,
        );
    }
}
