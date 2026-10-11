// AI writer for 2lab blog posts. Run by .github/workflows/write-post.yml.
//
// Picks every topic in content/topics/ whose status is `queued` or `rewrite`
// (only TOPIC_SLUG when set), marks it `writing` (pushed right away in CI so
// the CMS shows it), then:
//   scope check -> outline (vi) -> write (vi) -> self-review (vi) -> rewrite
//   for English readers -> social posts -> studio-facts check -> price check
//   -> hashtags -> CMS-safe bold/italic -> MDX check
// and writes content/blog/{vi,en}/<slug>.mdx with `draft: true`. The topic
// moves to `review`. Nothing is published: a person unticks "draft" in the CMS.
//
// `--recover` (run by the workflow when a job fails or is cancelled) moves
// topics left in `writing` out of it, so they do not look busy forever.
//
// Env: GEMINI_API_KEY (required), GEMINI_MODEL, TOPIC_SLUG, SITE_URL,
//      TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (optional notification),
//      GITHUB_OUTPUT (set by Actions; receives `commit_message`).

import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { parse, parseDocument, stringify } from 'yaml';
import { fixEmphasis } from './emphasis.mjs';

const ROOT = process.cwd();
const TOPICS_DIR = path.join(ROOT, 'content/topics');
const BLOG_DIR = path.join(ROOT, 'content/blog');
const SETTINGS_FILE = path.join(ROOT, 'content/settings/ai.yml');
const SITE_URL = (process.env.SITE_URL || 'https://2lab.vn').replace(/\/$/, '');
// Only used when content/settings/ai.yml has no model. Google retires model names
// often; a retired one fails with a 404 that the topic's AI log explains.
const DEFAULT_MODEL = 'gemini-3.8-flash';

// Same YAML style as Sveltia (cms/config.yml `output.yaml`) and Prettier.
const YAML_STYLE = { indent: 4, indentSeq: true, lineWidth: 0 };

// ---------------------------------------------------------------------------
// Prices are never published. This policy is part of the code, not of
// content/settings/ai.yml, so editing the settings in the CMS cannot remove it.

const PRICE_POLICY = `TUYỆT ĐỐI KHÔNG nêu giá, khoảng giá, mức phí, chi phí ước tính, khuyến mãi, giảm giá hay so sánh giá, bằng bất kỳ đơn vị tiền tệ nào (đồng, VNĐ, k, triệu, USD, $...), kể cả giá của thị trường hay của nơi khác. Khi người đọc có thể quan tâm đến chi phí, viết rằng mỗi dự án được báo giá riêng và mời họ liên hệ 2lab để được báo giá.
NEVER mention prices, price ranges, fees, cost estimates, discounts or price comparisons in any currency, including market or competitor prices. When cost is relevant, say each project is quoted individually and invite the reader to contact 2lab for a quote.`;

// Like the price policy: what the AI may say about 2lab is limited to the
// studio facts, and that rule cannot be removed from the CMS.
const FACTS_POLICY = `Chỉ được viết rằng 2lab có, làm, cung cấp, cam kết hay đạt được điều gì khi điều đó có trong "Thông tin về 2lab". Không suy diễn thêm dịch vụ (ví dụ thiết kế artwork, phát hành, quay MV, quảng bá nếu chúng không có trong danh sách), thiết bị, nhân sự, quy trình, thời gian bàn giao, số lần sửa, chính sách hay con số nào khác, kể cả khi chủ đề, ghi chú hay góp ý nhắc tới. Kiến thức chung về âm nhạc thì được viết, nhưng không gắn với 2lab.
Only say 2lab has, does, offers, promises or achieved something when it is listed in the 2lab facts. Do not infer any other service, equipment, staff, process, turnaround, revision policy or number, even if the topic or notes mention it. General music knowledge is fine as long as it is not attributed to 2lab.`;

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

// ---------------------------------------------------------------------------
// Gemini

async function gemini({ model, system, prompt, schema, temperature = 0.7 }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const body = {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            temperature,
            responseMimeType: 'application/json',
            responseSchema: schema,
        },
    };

    for (let attempt = 1; ; attempt++) {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            const data = await res.json();
            const text =
                data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
            if (!text)
                throw new Error(
                    `Gemini returned no text (${data.candidates?.[0]?.finishReason ?? 'no candidate'})`,
                );
            return JSON.parse(text);
        }
        // Free tier: 429 when over the per-minute limit. Wait and retry.
        if ((res.status === 429 || res.status >= 500) && attempt < 5) {
            await new Promise((r) => setTimeout(r, 15_000 * attempt));
            continue;
        }
        const detail = (await res.text()).slice(0, 500);
        if (res.status === 404) {
            throw new Error(
                `Model "${model}" không dùng được (Google trả 404). Vào Cài đặt AI → Model Gemini, chọn model khác rồi chọn lại "Chờ viết". Chi tiết: ${detail}`,
            );
        }
        throw new Error(`Gemini ${res.status}: ${detail}`);
    }
}

const S = (description) => ({ type: 'STRING', description });
const LIST = (description) => ({ type: 'ARRAY', items: { type: 'STRING' }, description });
const OBJ = (properties) => ({ type: 'OBJECT', properties, required: Object.keys(properties) });

// ---------------------------------------------------------------------------
// Prompts

function systemPrompt(settings, lang) {
    const list = (items) => (items ?? []).map((x) => `- ${x}`).join('\n');
    const glossary = (settings.glossary ?? [])
        .map((g) => `- ${g.vi} ↔ ${g.en}${g.note ? ` (${g.note})` : ''}`)
        .join('\n');

    return `Bạn là biên tập viên nội dung của 2lab, phòng thu âm và sản xuất âm nhạc.
${lang === 'en' ? 'You write for English-speaking readers in natural, idiomatic English.' : 'Bạn viết tiếng Việt tự nhiên như người Việt viết, không văn dịch.'}

Giọng văn: ${settings.voice ?? ''}
Người đọc: ${settings.audience ?? ''}

Quy tắc:
${list(settings.rules)}

Bảng thuật ngữ (dùng thống nhất):
${glossary}

Thông tin về 2lab (chỉ được dùng những thông tin này khi nói về 2lab):
${list(settings.studioFacts)}

Không được viết:
${list(settings.bannedClaims)}

${FACTS_POLICY}

${PRICE_POLICY}

Định dạng: Markdown. Không dùng HTML, JSX, import/export, ký tự { } hay < >. Không chèn ảnh. Không bịa số liệu, nghiên cứu hay trích dẫn; nếu không chắc một thông tin kỹ thuật, ghi vào danh sách cảnh báo.`;
}

const SCHEMAS = {
    scope: OBJ({
        unsupported: LIST(
            'Những điều chủ đề muốn bài nói 2lab có/làm/cung cấp nhưng không có trong Thông tin về 2lab. Rỗng nếu không có.',
        ),
    }),
    facts: OBJ({
        claims: {
            type: 'ARRAY',
            items: OBJ({
                field: S('Tên trường chứa câu vi phạm, đúng như khóa trong dữ liệu, ví dụ vi_body'),
                claim: S('Câu vi phạm, trích nguyên văn'),
            }),
        },
    }),
    outline: OBJ({
        title: S('Tiêu đề SEO tiếng Việt, chứa từ khóa, dưới 65 ký tự'),
        description: S('Meta description tiếng Việt, 120–160 ký tự, chứa từ khóa'),
        tags: LIST('3–5 thẻ tiếng Việt'),
        outline: {
            type: 'ARRAY',
            items: OBJ({ heading: S('Tiêu đề mục (H2)'), points: LIST('Ý chính của mục') }),
        },
    }),
    write: OBJ({ body: S('Toàn bộ bài viết Markdown, bắt đầu bằng đoạn mở bài, các mục dùng ##') }),
    review: OBJ({
        body: S('Bài viết đã sửa, Markdown'),
        flags: LIST(
            'Những điểm người duyệt cần kiểm tra (thông tin chưa chắc chắn, chỗ cần ảnh/âm thanh thật). Rỗng nếu không có.',
        ),
    }),
    english: OBJ({
        title: S('SEO title in English with the English keyword, under 65 characters'),
        description: S('Meta description in English, 120–160 characters'),
        tags: LIST('3–5 English tags'),
        body: S('Full article in Markdown'),
    }),
    social: OBJ({
        facebook: S('Bài Facebook tiếng Việt, 80–150 từ, có lời kêu gọi đọc bài, không có hashtag'),
        // Hashtags are added by code from the post tags (addHashtags), so they are
        // always spelled right.
        instagram: S('Caption Instagram tiếng Việt, ngắn, KHÔNG viết hashtag'),
        zalo: S('Tin nhắn Zalo OA tiếng Việt, dưới 80 từ, thân thiện'),
        tiktokScript: S(
            'Kịch bản TikTok 30–45 giây tiếng Việt: hook 3 giây đầu, các cảnh, lời thoại, kêu gọi hành động',
        ),
    }),
};

async function writePost({ model, settings, topic, slug, existing }) {
    const sysVi = systemPrompt(settings, 'vi');
    const sysEn = systemPrompt(settings, 'en');
    const request = `Chủ đề: ${topic.title}
Từ khóa chính (tiếng Việt): ${topic.keywordVi}
${topic.notes ? `Ghi chú của 2lab: ${topic.notes}` : ''}`;

    // Before writing: what does the topic ask us to claim that the facts do not
    // back? The writer is told not to claim it, and the reviewer gets a flag.
    console.log(`  scope`);
    const scope = await gemini({
        model,
        system: sysVi,
        temperature: 0.1,
        prompt: `${request}
${topic.feedback ? `Góp ý của người duyệt: ${topic.feedback}` : ''}

Đối chiếu yêu cầu trên với "Thông tin về 2lab". Liệt kê những dịch vụ, cam kết, quy trình, thiết bị hay con số mà yêu cầu muốn bài nói 2lab có hoặc làm, nhưng KHÔNG có trong danh sách. Kiến thức chung về âm nhạc không tính. Rỗng nếu không có.`,
        schema: SCHEMAS.scope,
    });
    const unsupported = scope.unsupported ?? [];
    const brief = unsupported.length
        ? `${request}

KHÔNG được viết rằng 2lab có hoặc làm những điều sau, vì chúng không có trong Thông tin về 2lab:
${unsupported.map((x) => `- ${x}`).join('\n')}
Nếu cần, chỉ giải thích chung cho người đọc, không gắn với 2lab.`
        : request;
    const rewrite =
        existing && topic.feedback
            ? `\n\nĐây là bản viết lại. Góp ý của người duyệt (bắt buộc làm theo):\n${topic.feedback}\n\nBản cũ:\n${existing.vi.content}`
            : '';

    console.log(`  outline`);
    const outline = await gemini({
        model,
        system: sysVi,
        prompt: `${brief}${rewrite}\n\nLập dàn ý cho bài blog 1200–1800 từ, trả lời đúng ý định tìm kiếm của từ khóa. 5–8 mục.`,
        schema: SCHEMAS.outline,
    });

    console.log(`  write vi`);
    const draft = await gemini({
        model,
        system: sysVi,
        prompt: `${brief}${rewrite}\n\nDàn ý:\n${JSON.stringify(outline, null, 2)}\n\nViết bài hoàn chỉnh theo dàn ý. Không lặp lại tiêu đề bài ở đầu.`,
        schema: SCHEMAS.write,
    });

    console.log(`  review vi`);
    const reviewed = await gemini({
        model,
        system: sysVi,
        temperature: 0.3,
        prompt: `${brief}\n\nTự kiểm tra và sửa bài dưới đây:
1. Lỗi chính tả, câu văn dịch máy, câu sáo rỗng.
2. Thuật ngữ đúng bảng thuật ngữ, giải thích thuật ngữ ở lần đầu.
3. Thông tin về 2lab chỉ lấy từ danh sách được cho phép.
4. Xóa mọi giá, chi phí, con số tiền. Thay bằng lời mời liên hệ để được báo giá.
5. Xóa lời hứa hẹn kết quả và tên khách hàng.
Trả về bài đã sửa và danh sách cảnh báo cho người duyệt (bằng tiếng Việt).

Bài:\n${draft.body}`,
        schema: SCHEMAS.review,
    });

    console.log(`  write en`);
    const en = await gemini({
        model,
        system: sysEn,
        prompt: `Topic: ${topic.title}
Main English keyword: ${topic.keywordEn || topic.keywordVi}
${topic.feedback && existing ? `Reviewer feedback: ${topic.feedback}` : ''}

Below is the Vietnamese article. Do not translate it sentence by sentence. Rewrite it for English-speaking readers searching the English keyword: same facts and structure where it helps, natural English phrasing and examples, English SEO title and description.

Vietnamese article:\n${reviewed.body}`,
        schema: SCHEMAS.english,
    });

    console.log(`  social`);
    const social = await gemini({
        model,
        system: sysVi,
        prompt: `Viết nội dung mạng xã hội giới thiệu bài blog dưới đây. Link bài: ${SITE_URL}/vi/blog/${slug}

Tiêu đề: ${outline.title}
Bài:\n${reviewed.body}`,
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

// ---------------------------------------------------------------------------
// Checks

/** Every text field of a post, keyed by where it goes, for the price scan. */
function textFields(post) {
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

function priceHits(post) {
    return Object.entries(textFields(post))
        .map(([field, text]) => ({ field, hits: findPrices(text) }))
        .filter((x) => x.hits.length);
}

// Field names go to Gemini as JSON schema keys, so use `vi_body`, not `vi.body`.
const toKey = (field) => field.replace('.', '_');
const fromKey = (key) => key.replace('_', '.');

/** Asks the model once to rewrite the given fields of the post, in place. */
async function fixFields({ model, settings, post, fields, instruction }) {
    const all = textFields(post);
    const input = Object.fromEntries(
        [...new Set(fields)].filter((f) => f in all).map((f) => [toKey(f), all[f]]),
    );
    if (!Object.keys(input).length) return;

    const fixed = await gemini({
        model,
        system: systemPrompt(settings, 'vi'),
        temperature: 0.2,
        prompt: `${instruction}

Sửa từng trường dưới đây. Giữ nguyên ngôn ngữ, định dạng Markdown và phần còn lại.

${JSON.stringify(input, null, 2)}`,
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
        prompt: `Thông tin về 2lab (nguồn duy nhất được phép):
${(settings.studioFacts ?? []).map((x) => `- ${x}`).join('\n')}

Kiểm tra các trường dưới đây. Tìm mọi câu nói 2lab có, làm, cung cấp, cam kết hay đạt được điều gì KHÔNG có trong danh sách trên: dịch vụ, thiết bị, nhân sự, quy trình, thời gian, chính sách, con số, khách hàng.
Không tính: kiến thức chung về âm nhạc; lời mời liên hệ hoặc báo giá riêng; diễn đạt lại thông tin có trong danh sách; việc hiển nhiên thuộc dịch vụ đã liệt kê (ví dụ kỹ thuật viên hỗ trợ khi thu âm).
Trả về danh sách vi phạm, rỗng nếu không có.

${JSON.stringify(fields, null, 2)}`,
        schema: SCHEMAS.facts,
    });
    return claims
        .map(({ field, claim }) => ({ field: fromKey(String(field)), claim }))
        .filter(({ claim }) => claim);
}

/** Checks the post against the studio facts, fixes once, and flags what is left. */
async function enforceStudioFacts({ model, settings, post }) {
    let claims = await unsupportedClaims({ model, settings, post });
    if (!claims.length) return;

    console.log(`  removing ${claims.length} claim(s) not in the studio facts`);
    await fixFields({
        model,
        settings,
        post,
        fields: claims.map((c) => c.field),
        instruction: `Các câu sau nói về 2lab nhưng không có trong Thông tin về 2lab:
${claims.map((c) => `- ${c.claim}`).join('\n')}

Xóa hoặc viết lại các câu đó để không còn nói 2lab có hoặc làm điều không có trong danh sách. Nếu cần, giữ phần giải thích chung nhưng không gắn với 2lab.`,
    });

    claims = await unsupportedClaims({ model, settings, post });
    for (const { field, claim } of claims) {
        post.flags.push(
            `❗ Có thể chưa đúng Thông tin studio (${field}): "${claim}". Kiểm tra trước khi xuất bản.`,
        );
    }
}

/** "Hòa âm phối khí" -> "#hoaamphoikhi". */
export function toHashtag(text) {
    const word = String(text)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    return word ? `#${word}` : '';
}

/** Replaces any hashtags the model wrote with ones built from the post tags. */
function addHashtags(post) {
    const tags = [...new Set(['#2lab', ...post.vi.tags.map(toHashtag)].filter(Boolean))];
    const strip = (text) =>
        String(text ?? '')
            .replace(/(^|\s)#[\p{L}\p{N}_]+/gu, '$1')
            .replace(/[ \t]+\n/g, '\n')
            .trim();
    for (const key of Object.keys(post.social)) post.social[key] = strip(post.social[key]);
    post.social.instagram = `${post.social.instagram}\n\n${tags.join(' ')}`;
}

const mdxParser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);

/** The site renders posts with remark-mdx; a body it cannot parse would break the build. */
function assertValidMdx(body, label) {
    try {
        mdxParser.parse(body);
    } catch (err) {
        throw new Error(`${label} is not valid MDX: ${err.message}`);
    }
}

/** Strips a leading "# Title" the model sometimes adds; the page renders the title itself. */
const cleanBody = (body) => body.trim().replace(/^#\s+[^\n]*\n+/, '') + '\n';

// ---------------------------------------------------------------------------
// Files

const today = () => new Date().toISOString().slice(0, 10);
const exists = (p) =>
    fs.access(p).then(
        () => true,
        () => false,
    );
const postFile = (locale, slug) => path.join(BLOG_DIR, locale, `${slug}.mdx`);

async function readPost(locale, slug) {
    const file = postFile(locale, slug);
    if (!(await exists(file))) return null;
    const { data, content } = matter(await fs.readFile(file, 'utf8'));
    return { data, content };
}

function toMdx(frontmatter, body) {
    const clean = Object.fromEntries(
        Object.entries(frontmatter).filter(([, v]) => v !== undefined && v !== null),
    );
    return `---\n${stringify(clean, YAML_STYLE)}---\n\n${body}`;
}

const dateString = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value);

async function writeFiles({ slug, post, existing }) {
    const prev = existing?.vi.data ?? {};
    const shared = {
        draft: true,
        publishedAt: dateString(prev.publishedAt) ?? today(),
        updatedAt: existing ? today() : undefined,
        author: prev.author ?? '2lab',
        category: prev.category ?? 'music-knowledge',
        image: prev.image,
    };

    // Fields without `i18n` in cms/config.yml (aiFlags, social) live only in the
    // default-locale (vi) file, like Sveltia writes them.
    const vi = {
        title: post.vi.title,
        description: post.vi.description,
        ...shared,
        tags: post.vi.tags,
        aiFlags: post.flags.length ? post.flags : undefined,
        social: { ...post.social, status: 'pending' },
    };
    const en = {
        title: post.en.title,
        description: post.en.description,
        ...shared,
        tags: post.en.tags,
    };

    await fs.writeFile(postFile('vi', slug), toMdx(vi, post.vi.body));
    await fs.writeFile(postFile('en', slug), toMdx(en, post.en.body));
}

async function updateTopic(file, values) {
    const doc = parseDocument(await fs.readFile(file, 'utf8'));
    for (const [key, value] of Object.entries(values)) {
        if (value === undefined) doc.delete(key);
        else doc.set(key, value);
    }
    await fs.writeFile(file, doc.toString(YAML_STYLE));
}

/** Uses the topic's post slug, else the topic file name; never takes over another topic's post. */
async function pickSlug(topicSlug, topic) {
    if (topic.postSlug) return topic.postSlug;
    let slug = topicSlug;
    for (
        let n = 2;
        (await exists(postFile('vi', slug))) || (await exists(postFile('en', slug)));
        n++
    ) {
        slug = `${topicSlug}-${n}`;
    }
    return slug;
}

// ---------------------------------------------------------------------------

async function notify(lines) {
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

const git = (...args) => execFileSync('git', args, { stdio: 'inherit' });

/**
 * In CI, commits and pushes one topic file right away, so editors see the
 * `writing` status in the CMS while the AI works. The workflow commits the
 * rest at the end. Pushes made with GITHUB_TOKEN do not start new workflow
 * runs, and Vercel skips builds for topic-only commits (vercel.json).
 */
async function pushProgress(file, message) {
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

/** After a failed or cancelled run: no topic should stay in `writing`. */
async function recover() {
    const files = (await fs.readdir(TOPICS_DIR).catch(() => [])).filter((f) => f.endsWith('.yml'));
    const stuck = [];
    for (const name of files) {
        const file = path.join(TOPICS_DIR, name);
        const topic = parse(await fs.readFile(file, 'utf8')) ?? {};
        if (topic.status !== 'writing') continue;
        const hasPost = topic.postSlug && (await exists(postFile('vi', topic.postSlug)));
        await updateTopic(file, {
            status: hasPost ? 'review' : 'idea',
            aiLog: `${today()}: lỗi: Action bị dừng giữa chừng (xem tab Actions trên GitHub). Chọn lại "${hasPost ? 'Cần viết lại' : 'Chờ viết'}" để thử lại.`,
        });
        stuck.push(name.replace(/\.yml$/, ''));
    }
    const message = `content(ai): ${stuck.length ? `recover ${stuck.join(', ')}` : 'nothing to recover'}`;
    if (process.env.GITHUB_OUTPUT)
        await fs.appendFile(process.env.GITHUB_OUTPUT, `commit_message=${message}\n`);
    console.log(message);
}

export async function main() {
    if (process.argv.includes('--recover')) return recover();
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

    const settings = parse(await fs.readFile(SETTINGS_FILE, 'utf8')) ?? {};
    // Prices never go into a prompt, even if someone adds them to the settings file.
    delete settings.pricing;
    const model = process.env.GEMINI_MODEL || settings.model || DEFAULT_MODEL;

    const only = process.env.TOPIC_SLUG?.trim();
    const files = (await fs.readdir(TOPICS_DIR).catch(() => [])).filter((f) => f.endsWith('.yml'));

    const done = [];
    const failed = [];
    for (const name of files) {
        const topicSlug = name.replace(/\.yml$/, '');
        if (only && topicSlug !== only) continue;

        const file = path.join(TOPICS_DIR, name);
        const topic = parse(await fs.readFile(file, 'utf8')) ?? {};
        if (!['queued', 'rewrite'].includes(topic.status)) continue;

        console.log(`Topic ${topicSlug} (${topic.status}), model ${model}`);
        const slug = await pickSlug(topicSlug, topic);
        await updateTopic(file, {
            status: 'writing',
            aiLog: `${today()}: AI đang viết bằng ${model}...`,
        });
        await pushProgress(file, `content(ai): writing ${topicSlug}`);
        try {
            if (!topic.title || !topic.keywordVi)
                throw new Error('Chủ đề cần có tiêu đề và từ khóa tiếng Việt.');

            const vi = await readPost('vi', slug);
            const en = await readPost('en', slug);
            const existing = vi && en ? { vi, en } : null;
            if (existing && vi.data.draft !== true) {
                throw new Error(
                    `Bài ${slug} đang xuất bản. AI không viết đè bài đã xuất bản; hãy tick "Bản nháp" cho bài rồi chọn lại "Cần viết lại".`,
                );
            }

            const post = await writePost({ model, settings, topic, slug, existing });
            post.vi.body = cleanBody(post.vi.body);
            post.en.body = cleanBody(post.en.body);

            await enforceStudioFacts({ model, settings, post });

            let hits = priceHits(post);
            if (hits.length) {
                console.log(`  removing prices from ${hits.map((h) => h.field).join(', ')}`);
                await fixFields({
                    model,
                    settings,
                    post,
                    fields: hits.map((h) => h.field),
                    instruction: `Các đoạn văn sau có nhắc tới giá hoặc chi phí: ${hits.flatMap((h) => h.hits).join(' | ')}

Xóa mọi con số tiền, giá, khoảng giá, mức phí. Thay bằng câu mời liên hệ 2lab để được báo giá.`,
                });
                hits = priceHits(post);
            }
            if (hits.length) {
                throw new Error(
                    `AI vẫn nhắc tới giá sau khi sửa (${hits.map((h) => `${h.field}: "${h.hits[0]}"`).join('; ')}). Không ghi bài.`,
                );
            }

            addHashtags(post);
            // Bold that Sveltia would break the first time an editor saves the post.
            for (const locale of ['vi', 'en']) {
                const { body, unfixable } = fixEmphasis(post[locale].body);
                post[locale].body = body;
                for (const { text } of unfixable) {
                    post.flags.push(
                        `Định dạng in đậm/nghiêng ${text} (bản ${locale}) có thể bị hỏng khi lưu trong CMS. Kiểm tra lại.`,
                    );
                }
            }
            assertValidMdx(post.vi.body, 'vi body');
            assertValidMdx(post.en.body, 'en body');

            await writeFiles({ slug, post, existing });
            await updateTopic(file, {
                status: 'review',
                postSlug: slug,
                aiLog: `${today()}: đã viết ${slug} bằng ${model}${post.flags.length ? `, ${post.flags.length} cảnh báo` : ''}.`,
            });
            done.push(slug);
            console.log(`  wrote content/blog/{vi,en}/${slug}.mdx`);
        } catch (err) {
            console.error(`  failed: ${err.message}`);
            failed.push({ topicSlug, message: err.message });
            // Out of the queue so the next topic save does not retry it in a loop.
            await updateTopic(file, {
                status: topic.status === 'rewrite' ? 'review' : 'idea',
                aiLog: `${today()}: lỗi: ${err.message}`,
            });
        }
    }

    await notify([
        ...done.map(
            (slug) =>
                `✍️ AI đã viết xong "${slug}". Chờ duyệt:\n${SITE_URL}/admin/#/collections/blog/entries/${slug}\nXem trước: ${SITE_URL}/vi/blog/preview/${slug}`,
        ),
        ...failed.map(
            ({ topicSlug, message }) => `⚠️ AI không viết được "${topicSlug}": ${message}`,
        ),
    ]);

    const parts = [
        done.length && `draft ${done.join(', ')}`,
        failed.length && `failed ${failed.map((f) => f.topicSlug).join(', ')}`,
    ];
    const message = `content(ai): ${parts.filter(Boolean).join('; ') || 'no queued topics'}`;
    if (process.env.GITHUB_OUTPUT)
        await fs.appendFile(process.env.GITHUB_OUTPUT, `commit_message=${message}\n`);
    console.log(message);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
