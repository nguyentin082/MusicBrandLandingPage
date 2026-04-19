export type TocItem = {
    id: string;
    text: string;
    level: 2 | 3;
};

function extractNodeText(node: unknown): string {
    if (!node || typeof node !== 'object') {
        return '';
    }

    const valueNode = node as { value?: unknown; children?: unknown[] };

    if (typeof valueNode.value === 'string') {
        return valueNode.value;
    }

    if (!Array.isArray(valueNode.children)) {
        return '';
    }

    return valueNode.children.map((child) => extractNodeText(child)).join('');
}

export function rehypeCollectHeadings(output: TocItem[]) {
    return function attacher() {
        return (tree: unknown) => {
            const visitNode = (node: unknown) => {
                if (!node || typeof node !== 'object') {
                    return;
                }

                const elementNode = node as {
                    type?: string;
                    tagName?: string;
                    properties?: Record<string, unknown>;
                    children?: unknown[];
                };

                const isHeading = elementNode.tagName === 'h2' || elementNode.tagName === 'h3';
                if (elementNode.type === 'element' && isHeading) {
                    const idValue = elementNode.properties?.id;
                    const id =
                        typeof idValue === 'string'
                            ? idValue
                            : Array.isArray(idValue) && typeof idValue[0] === 'string'
                              ? idValue[0]
                              : '';
                    const text = extractNodeText(elementNode).replace(/\s+/g, ' ').trim();

                    if (id && text) {
                        output.push({
                            id,
                            text,
                            level: elementNode.tagName === 'h2' ? 2 : 3,
                        });
                    }
                }

                if (Array.isArray(elementNode.children)) {
                    for (const child of elementNode.children) {
                        visitNode(child);
                    }
                }
            };

            visitNode(tree);
        };
    };
}

export function rehypeOptimizeImages() {
    return (tree: unknown) => {
        const visitNode = (node: unknown) => {
            if (!node || typeof node !== 'object') {
                return;
            }

            const elementNode = node as {
                type?: string;
                tagName?: string;
                properties?: Record<string, unknown>;
                children?: unknown[];
            };

            if (elementNode.type === 'element' && elementNode.tagName === 'img') {
                elementNode.properties ??= {};

                if (!('loading' in elementNode.properties)) {
                    elementNode.properties.loading = 'lazy';
                }

                if (!('decoding' in elementNode.properties)) {
                    elementNode.properties.decoding = 'async';
                }

                if (!('fetchpriority' in elementNode.properties)) {
                    elementNode.properties.fetchpriority = 'low';
                }
            }

            if (Array.isArray(elementNode.children)) {
                for (const child of elementNode.children) {
                    visitNode(child);
                }
            }
        };

        visitNode(tree);
    };
}
