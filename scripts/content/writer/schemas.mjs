// What each Gemini call returns. The descriptions are part of the prompt.

import { LIST, OBJ, S } from './gemini.mjs';

export const SCHEMAS = {
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
