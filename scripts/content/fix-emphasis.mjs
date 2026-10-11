// Finds and fixes bold/italic in blog posts that Sveltia CMS would break on
// save (see scripts/content/emphasis.mjs).
//
//   node scripts/content/fix-emphasis.mjs           fix the files in place
//   node scripts/content/fix-emphasis.mjs --check   only report; exit 1 if anything is found

import fs from 'node:fs/promises';
import path from 'node:path';
import { fixEmphasis } from './emphasis.mjs';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');
const FRONTMATTER = /^---\n[\s\S]*?\n---\n/;
const check = process.argv.includes('--check');

let found = 0;
for (const locale of await fs.readdir(BLOG_DIR)) {
    const dir = path.join(BLOG_DIR, locale);
    if (!(await fs.stat(dir)).isDirectory()) continue;

    for (const name of (await fs.readdir(dir)).filter((f) => f.endsWith('.mdx'))) {
        const file = path.join(dir, name);
        const source = await fs.readFile(file, 'utf8');
        const head = source.match(FRONTMATTER)?.[0] ?? '';
        const { body, fixed, unfixable } = fixEmphasis(source.slice(head.length));
        const offset = head.split('\n').length - 1;
        const rel = path.relative(process.cwd(), file);

        for (const { line, before } of fixed) console.log(`${rel}:${line + offset}  ${before}`);
        for (const { line, text } of unfixable)
            console.log(`${rel}:${line + offset}  ${text}  (needs a manual fix)`);
        found += fixed.length + unfixable.length;

        if (!check && fixed.length) await fs.writeFile(file, head + body);
    }
}

console.log(
    found
        ? `${found} emphasis ${check ? 'found' : 'handled'} that Sveltia would break.`
        : 'No emphasis that Sveltia would break.',
);
if (check && found) process.exit(1);
