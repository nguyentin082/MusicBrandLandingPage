import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

export const BLOG_LOCALES = ['en', 'vi'] as const;
export type BlogLocale = (typeof BLOG_LOCALES)[number];

export type BlogPostMeta = {
    slug: string;
    locale: BlogLocale;
    title: string;
    description: string;
    publishedAt: string;
    updatedAt?: string;
    tags: string[];
    coverImage?: string;
    readingTimeMinutes: number;
};

export type BlogPost = BlogPostMeta & {
    content: string;
};

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

type Frontmatter = {
    title?: string;
    description?: string;
    publishedAt?: string;
    updatedAt?: string;
    tags?: string[];
    coverImage?: string;
    draft?: boolean;
};

function isBlogLocale(value: string): value is BlogLocale {
    return BLOG_LOCALES.includes(value as BlogLocale);
}

function getLocaleDir(locale: BlogLocale) {
    return path.join(CONTENT_DIR, locale);
}

async function fileExists(filePath: string) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

function normalizeSlug(fileName: string) {
    return fileName.replace(/\.mdx?$/, '');
}

function estimateReadingTimeMinutes(content: string) {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const wordsPerMinute = 220;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function toISODate(input: string | undefined) {
    if (!input) return undefined;
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString();
}

async function getLocaleFileNames(locale: BlogLocale) {
    const dir = getLocaleDir(locale);

    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        return entries
            .filter((entry) => entry.isFile() && /\.mdx?$/.test(entry.name))
            .map((entry) => entry.name);
    } catch {
        return [];
    }
}

async function readPostFile(locale: BlogLocale, slug: string) {
    const filePath = path.join(getLocaleDir(locale), `${slug}.mdx`);
    if (!(await fileExists(filePath))) {
        return null;
    }

    const source = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(source);
    const frontmatter = data as Frontmatter;

    if (frontmatter.draft) {
        return null;
    }

    if (!frontmatter.title || !frontmatter.description || !frontmatter.publishedAt) {
        return null;
    }

    const publishedAt = toISODate(frontmatter.publishedAt);
    if (!publishedAt) {
        return null;
    }

    const updatedAt = toISODate(frontmatter.updatedAt);

    return {
        slug,
        locale,
        title: frontmatter.title,
        description: frontmatter.description,
        publishedAt,
        updatedAt,
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        coverImage: frontmatter.coverImage,
        readingTimeMinutes: estimateReadingTimeMinutes(content),
        content,
    } satisfies BlogPost;
}

export async function getAllPosts(locale: BlogLocale): Promise<BlogPostMeta[]> {
    const fileNames = await getLocaleFileNames(locale);

    const posts = await Promise.all(
        fileNames.map(async (fileName) => {
            const post = await readPostFile(locale, normalizeSlug(fileName));
            if (!post) return null;

            const { content: _content, ...meta } = post;
            return meta;
        }),
    );

    return posts
        .filter(Boolean)
        .sort(
            (a, b) => new Date(b!.publishedAt).getTime() - new Date(a!.publishedAt).getTime(),
        ) as BlogPostMeta[];
}

export async function getPost(locale: BlogLocale, slug: string): Promise<BlogPost | null> {
    return readPostFile(locale, slug);
}

export async function hasPost(locale: BlogLocale, slug: string) {
    return (await readPostFile(locale, slug)) !== null;
}

export async function getAllPostParams() {
    const localeEntries = await Promise.all(
        BLOG_LOCALES.map(async (locale) => {
            const posts = await getAllPosts(locale);
            return posts.map((post) => ({ lang: locale, slug: post.slug }));
        }),
    );

    return localeEntries.flat();
}

export function toBlogLocale(value: string): BlogLocale | null {
    return isBlogLocale(value) ? value : null;
}
