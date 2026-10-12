// Paths, site URL and the AI settings shared by the writer modules.

import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';

const ROOT = process.cwd();
export const TOPICS_DIR = path.join(ROOT, 'content/topics');
export const BLOG_DIR = path.join(ROOT, 'content/blog');
const SETTINGS_FILE = path.join(ROOT, 'content/settings/ai.yml');
export const SITE_URL = (process.env.SITE_URL || 'https://2lab.vn').replace(/\/$/, '');
// Only used when content/settings/ai.yml has no model. Google retires model names
// often; a retired one fails with a 404 that the topic's AI log explains.
const DEFAULT_MODEL = 'gemini-3.8-flash';

// Same YAML style as Sveltia (cms/config.yml `output.yaml`) and Prettier.
export const YAML_STYLE = { indent: 4, indentSeq: true, lineWidth: 0 };

/** content/settings/ai.yml (edited in the CMS) and the model to use. */
export async function loadSettings() {
    const settings = parse(await fs.readFile(SETTINGS_FILE, 'utf8')) ?? {};
    // Prices never go into a prompt, even if someone adds them to the settings file.
    delete settings.pricing;
    const model = process.env.GEMINI_MODEL || settings.model || DEFAULT_MODEL;
    return { settings, model };
}
