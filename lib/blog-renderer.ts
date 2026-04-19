import 'server-only';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { rehypeCollectHeadings, rehypeOptimizeImages, type TocItem } from '@/lib/blog-content';

export async function renderBlogPostContent(content: string) {
    const tocItems: TocItem[] = [];

    const renderedPost = await unified()
        .use(remarkParse)
        .use(remarkMdx)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeSlug)
        .use(rehypeCollectHeadings(tocItems))
        .use(rehypeAutolinkHeadings, { behavior: 'append' })
        .use(rehypeOptimizeImages)
        .use(rehypeStringify)
        .process(content);

    return {
        contentHtml: String(renderedPost),
        tocItems,
    };
}
