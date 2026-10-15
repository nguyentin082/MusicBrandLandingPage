# AI writer prompts

Prompts for `scripts/content/write-post.mjs`, one file per prompt. The code
fills them with `template(name, vars)` from `writer/prompts.mjs`.

- `{{name}}` is replaced by a value. A name the code does not pass is an error,
  so a typo fails the run instead of sending `{{tyop}}` to Gemini.
- A block between `{{#name}}` and `{{/name}}`, each on its own line, is kept
  only when `name` is not empty.
- `<!-- comments -->` are notes for editors and are not sent to Gemini.

Settings editors change in the CMS (voice, rules, glossary, studio facts...)
stay in `content/settings/ai.yml`; `system.md` puts them in. The price and
studio-facts policies live here, outside the CMS, so the CMS cannot remove them.
The descriptions of each JSON field the model returns are in `writer/schemas.mjs`.

Order of calls for each topic:

| Step               | System prompt    | Prompt                                                     |
| ------------------ | ---------------- | ---------------------------------------------------------- |
| scope              | `system.md` (vi) | `scope.md` (with `request.md`)                             |
| outline            | `system.md` (vi) | `outline.md` (with `brief.md`, `rewrite.md`)               |
| write vi           | `system.md` (vi) | `write.md` (with `brief.md`, `rewrite.md`)                 |
| review vi          | `system.md` (vi) | `review.md` (with `brief.md`)                              |
| write en           | `system.md` (en) | `english.md`                                               |
| social             | `system.md` (vi) | `social.md`                                                |
| studio-facts check | `system.md` (vi) | `facts-check.md`, then `fix-fields.md` with `fix-facts.md` |
| price check        | `system.md` (vi) | `fix-fields.md` with `fix-prices.md`                       |
