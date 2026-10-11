// Bold/italic that Sveltia CMS would break on save.
//
// Sveltia's editor (Lexical) checks `*` delimiters with the CommonMark
// flanking rules, but only counts ASCII characters as punctuation. So in
//   **"tai của thế giới"**—nó
// the closing `**` sits between `"` and `—`, Lexical does not see bold there,
// keeps the asterisks as text, and saves them escaped: \*\*"tai của thế giới"\*\*
// The site (remark, full CommonMark) renders the original as bold, so the
// problem only shows up after someone saves the post in the CMS.
//
// The fix moves quotes and other punctuation at the edge of the bold text
// outside the delimiters: "**tai của thế giới**"— which both parsers accept.

import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

const WHITESPACE = /\s/;
// Lexical's punctuation set: ASCII only.
const ASCII_PUNCT = /[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]/;
// Punctuation that can move outside the delimiters without changing meaning.
// Not brackets or backticks: those belong to links and code.
const MOVABLE = `"'(),.:;!?`;

const parser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);

/** Lexical's check for a `*` delimiter run at `index` (see the comment above). */
function lexicalAccepts(text, index, length, opening) {
    const before = text[index - 1];
    const after = text[index + length];
    const [inner, outer] = opening ? [after, before] : [before, after];
    return (
        inner !== undefined &&
        !WHITESPACE.test(inner) &&
        (!ASCII_PUNCT.test(inner) ||
            outer === undefined ||
            WHITESPACE.test(outer) ||
            ASCII_PUNCT.test(outer))
    );
}

/** Every `*`/`**` emphasis in `body`, with whether Lexical accepts it. */
function emphasisSpans(body) {
    const spans = [];
    const visit = (node) => {
        if ((node.type === 'strong' || node.type === 'emphasis') && node.position) {
            const start = node.position.start.offset;
            const end = node.position.end.offset;
            const size = node.type === 'strong' ? 2 : 1;
            if (body[start] === '*' && body[end - 1] === '*') {
                const ok =
                    lexicalAccepts(body, start, size, true) &&
                    lexicalAccepts(body, end - size, size, false);
                spans.push({ start, end, size, ok });
            }
        }
        node.children?.forEach(visit);
    };
    visit(parser.parse(body));
    return spans;
}

/** The span rewritten with edge punctuation moved outside, or null if that does not help. */
function rewrite(body, { start, end, size }) {
    const delimiter = '*'.repeat(size);
    const inner = body.slice(start + size, end - size);
    let lead = '';
    let trail = '';
    let core = inner;
    while (core && MOVABLE.includes(core[0])) {
        lead += core[0];
        core = core.slice(1);
    }
    while (core && MOVABLE.includes(core.at(-1))) {
        trail = core.at(-1) + trail;
        core = core.slice(0, -1);
    }
    if (!core || (!lead && !trail)) return null;

    const replacement = `${lead}${delimiter}${core}${delimiter}${trail}`;
    const text = body.slice(0, start) + replacement + body.slice(end);
    const open = start + lead.length;
    const close = open + size + core.length;
    const ok = lexicalAccepts(text, open, size, true) && lexicalAccepts(text, close, size, false);
    return ok ? text : null;
}

const lineOf = (text, offset) => text.slice(0, offset).split('\n').length;

/**
 * Fixes every emphasis Sveltia would break where moving edge punctuation is
 * enough. Returns the new body, what was fixed, and what still needs a person.
 */
export function fixEmphasis(body) {
    const fixed = [];
    let text = body;
    for (;;) {
        const spans = emphasisSpans(text);
        const next = spans.find((s) => !s.ok && rewrite(text, s) !== null);
        if (!next) {
            const unfixable = spans
                .filter((s) => !s.ok)
                .map((s) => ({ line: lineOf(text, s.start), text: text.slice(s.start, s.end) }));
            return { body: text, fixed, unfixable };
        }
        const before = text.slice(next.start, next.end);
        text = rewrite(text, next);
        fixed.push({ line: lineOf(text, next.start), before });
    }
}
