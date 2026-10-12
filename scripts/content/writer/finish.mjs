// Last touches made by code, not by the model: body cleanup, hashtags,
// CMS-safe bold/italic and an MDX parse check.

import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { fixEmphasis } from '../emphasis.mjs';

/** Strips a leading "# Title" the model sometimes adds; the page renders the title itself. */
export const cleanBody = (body) => body.trim().replace(/^#\s+[^\n]*\n+/, '') + '\n';

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

/** Hashtags, CMS-safe emphasis and the MDX check, in place. Throws on invalid MDX. */
export function finishPost(post) {
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
}
