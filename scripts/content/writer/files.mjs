// Topic files (content/topics/*.yml) and post files (content/blog/{vi,en}/*.mdx).

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { parse, parseDocument, stringify } from 'yaml';
import { BLOG_DIR, TOPICS_DIR, YAML_STYLE } from './config.mjs';

export const today = () => new Date().toISOString().slice(0, 10);
const exists = (p) =>
    fs.access(p).then(
        () => true,
        () => false,
    );

// ---------------------------------------------------------------------------
// Topics

/** Every topic file as `{ slug, file }`. */
export async function listTopics() {
    const names = (await fs.readdir(TOPICS_DIR).catch(() => [])).filter((f) => f.endsWith('.yml'));
    return names.map((name) => ({
        slug: name.replace(/\.yml$/, ''),
        file: path.join(TOPICS_DIR, name),
    }));
}

// Read right before use: a progress push (git pull --rebase) may have changed it.
export const readTopic = async (file) => parse(await fs.readFile(file, 'utf8')) ?? {};

/** Sets (or, for `undefined`, removes) keys of a topic file, keeping its comments and order. */
export async function updateTopic(file, values) {
    const doc = parseDocument(await fs.readFile(file, 'utf8'));
    for (const [key, value] of Object.entries(values)) {
        if (value === undefined) doc.delete(key);
        else doc.set(key, value);
    }
    await fs.writeFile(file, doc.toString(YAML_STYLE));
}

// ---------------------------------------------------------------------------
// Posts

const postFile = (locale, slug) => path.join(BLOG_DIR, locale, `${slug}.mdx`);

export const postExists = (locale, slug) => exists(postFile(locale, slug));

async function readPost(locale, slug) {
    const file = postFile(locale, slug);
    if (!(await exists(file))) return null;
    const { data, content } = matter(await fs.readFile(file, 'utf8'));
    return { data, content };
}

/** Both locales of a post, or null unless both exist. */
export async function readExistingPost(slug) {
    const vi = await readPost('vi', slug);
    const en = await readPost('en', slug);
    return vi && en ? { vi, en } : null;
}

/** Uses the topic's post slug, else the topic file name; never takes over another topic's post. */
export async function pickSlug(topicSlug, topic) {
    if (topic.postSlug) return topic.postSlug;
    let slug = topicSlug;
    for (let n = 2; (await postExists('vi', slug)) || (await postExists('en', slug)); n++) {
        slug = `${topicSlug}-${n}`;
    }
    return slug;
}

function toMdx(frontmatter, body) {
    const clean = Object.fromEntries(
        Object.entries(frontmatter).filter(([, v]) => v !== undefined && v !== null),
    );
    return `---\n${stringify(clean, YAML_STYLE)}---\n\n${body}`;
}

const dateString = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value);

/** Writes both locales as drafts, keeping date, author, category and image of `existing`. */
export async function writePostFiles({ slug, post, existing }) {
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
