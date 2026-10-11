// AI writer for 2lab blog posts. Run by .github/workflows/write-post.yml.
//
// Picks every topic in content/topics/ whose status is `queued` or `rewrite`
// (only TOPIC_SLUG when set), then:
//   outline (vi) -> write (vi) -> self-review (vi) -> rewrite for English
//   readers -> social posts -> price check -> MDX check
// and writes content/blog/{vi,en}/<slug>.mdx with `draft: true`. The topic
// moves to `review`. Nothing is published: a person unticks "draft" in the CMS.
//
// Env: GEMINI_API_KEY (required), GEMINI_MODEL, TOPIC_SLUG, SITE_URL,
//      TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (optional notification),
//      GITHUB_OUTPUT (set by Actions; receives `commit_message`).

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { parse, parseDocument, stringify } from 'yaml';

const ROOT = process.cwd();
const TOPICS_DIR = path.join(ROOT, 'content/topics');
const BLOG_DIR = path.join(ROOT, 'content/blog');
const SETTINGS_FILE = path.join(ROOT, 'content/settings/ai.yml');
const SITE_URL = (process.env.SITE_URL || 'https://2lab.vn').replace(/\/$/, '');
const DEFAULT_MODEL = 'gemini-2.5-flash';

// Same YAML style as Sveltia (cms/config.yml `output.yaml`) and Prettier.
const YAML_STYLE = { indent: 4, indentSeq: true, lineWidth: 0 };

// ---------------------------------------------------------------------------
// Prices are never published. This policy is part of the code, not of
// content/settings/ai.yml, so editing the settings in the CMS cannot remove it.

const PRICE_POLICY = `TUYỆT ĐỐI KHÔNG nêu giá, khoảng giá, mức phí, chi phí ước tính, khuyến mãi, giảm giá hay so sánh giá, bằng bất kỳ đơn vị tiền tệ nào (đồng, VNĐ, k, triệu, USD, $...), kể cả giá của thị trường hay của nơi khác. Khi người đọc có thể quan tâm đến chi phí, viết rằng mỗi dự án được báo giá riêng và mời họ liên hệ 2lab để được báo giá.
NEVER mention prices, price ranges, fees, cost estimates, discounts or price comparisons in any currency, including market or competitor prices. When cost is relevant, say each project is quoted individually and invite the reader to contact 2lab for a quote.`;

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
        throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 500)}`);
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

${PRICE_POLICY}

Định dạng: Markdown. Không dùng HTML, JSX, import/export, ký tự { } hay < >. Không chèn ảnh. Không bịa số liệu, nghiên cứu hay trích dẫn; nếu không chắc một thông tin kỹ thuật, ghi vào danh sách cảnh báo.`;
}

const SCHEMAS = {
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
        facebook: S('Bài Facebook tiếng Việt, 80–150 từ, có lời kêu gọi đọc bài'),
        instagram: S('Caption Instagram tiếng Việt, ngắn, có 5–8 hashtag ở cuối'),
        zalo: S('Tin nhắn Zalo OA tiếng Việt, dưới 80 từ, thân thiện'),
        tiktokScript: S(
            'Kịch bản TikTok 30–45 giây tiếng Việt: hook 3 giây đầu, các cảnh, lời thoại, kêu gọi hành động',
        ),
    }),
};

async function writePost({ model, settings, topic, slug, existing }) {
    const sysVi = systemPrompt(settings, 'vi');
    const sysEn = systemPrompt(settings, 'en');
    const brief = `Chủ đề: ${topic.title}
Từ khóa chính (tiếng Việt): ${topic.keywordVi}
${topic.notes ? `Ghi chú của 2lab: ${topic.notes}` : ''}`;
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
        flags: reviewed.flags ?? [],
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

/** Asks the model once to remove prices from the offending fields. */
async function removePrices({ model, settings, post, hits }) {
    const fields = Object.fromEntries(hits.map(({ field }) => [field, textFields(post)[field]]));
    const schema = OBJ(
        Object.fromEntries(Object.keys(fields).map((k) => [k, S('Văn bản đã sửa')])),
    );
    const fixed = await gemini({
        model,
        system: systemPrompt(settings, 'vi'),
        temperature: 0.2,
        prompt: `Các đoạn văn sau có nhắc tới giá hoặc chi phí: ${hits.flatMap((h) => h.hits).join(' | ')}

Sửa từng trường: xóa mọi con số tiền, giá, khoảng giá, mức phí. Thay bằng câu mời liên hệ 2lab để được báo giá. Giữ nguyên ngôn ngữ, định dạng và phần còn lại.

${JSON.stringify(fields, null, 2)}`,
        schema,
    });

    for (const [field, text] of Object.entries(fixed)) {
        const [group, key] = field.split('.');
        const target = group === 'social' ? post.social : post[group];
        target[key] =
            key === 'tags'
                ? text
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                : text;
    }
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

export async function main() {
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

            let hits = priceHits(post);
            if (hits.length) {
                console.log(`  removing prices from ${hits.map((h) => h.field).join(', ')}`);
                await removePrices({ model, settings, post, hits });
                hits = priceHits(post);
            }
            if (hits.length) {
                throw new Error(
                    `AI vẫn nhắc tới giá sau khi sửa (${hits.map((h) => `${h.field}: "${h.hits[0]}"`).join('; ')}). Không ghi bài.`,
                );
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
