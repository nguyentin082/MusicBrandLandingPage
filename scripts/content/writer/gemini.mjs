// Gemini generateContent call with a JSON response schema.

let onWait = () => {};
/** Called with a message while a request waits to retry, and with '' once it succeeds. */
export const setWaitListener = (fn) => {
    onWait = fn;
};

export async function gemini({ model, system, prompt, schema, temperature = 0.7 }) {
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
            if (attempt > 1) onWait('');
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
            onWait(
                `Gemini đang ${res.status === 429 ? 'giới hạn lượt gọi' : 'quá tải'}, thử lại sau ${15 * attempt} giây (lần ${attempt + 1}/5)`,
            );
            await new Promise((r) => setTimeout(r, 15_000 * attempt));
            continue;
        }
        const detail = (await res.text()).slice(0, 500);
        if (res.status === 404) {
            throw new Error(
                `Model "${model}" không dùng được (Google trả 404). Vào Cài đặt AI → Model Gemini, chọn model khác rồi chọn lại "Chờ viết". Chi tiết: ${detail}`,
            );
        }
        throw new Error(`Gemini ${res.status}: ${detail}`);
    }
}

// Response schema helpers.
export const S = (description) => ({ type: 'STRING', description });
export const LIST = (description) => ({ type: 'ARRAY', items: { type: 'STRING' }, description });
export const OBJ = (properties) => ({
    type: 'OBJECT',
    properties,
    required: Object.keys(properties),
});
