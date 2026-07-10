---
name: novel-author
description: Write an original novel's full source content (manifest.json, Markdown chapters, optional characters and chapter-tagged scene art) in Pocket Library's package source format. Use when the user wants to write, draft, generate, or create a story/novel/book/short-story to read in Pocket Library, e.g. "write me a fantasy novel for pocket library", "generate a short story I can import", "draft a novel about X", or "/novel-author". Produces a source folder under novels/<id>/ ready for the novel-package skill to compress into a .novel file — this skill does not create the archive itself.
---

# Novel Author

Writes the source content for one novel in the exact folder shape Pocket Library's importer expects
(see `src/core/services/import.service.ts` and `README.md`'s package-format section, which are the
source of truth — re-check them if this skill feels out of date). This skill only produces plain
files (JSON + Markdown [+ images the user supplies]); it never touches the app's runtime code and
never compresses anything. Hand off to the `novel-package` skill once content is drafted.

## 1. Gather just enough to start

Don't interrogate the user. If they already gave a premise/genre/length, start writing. Otherwise ask
briefly for: premise or genre, and rough length. Default when unspecified:

- "short story" → 3–5 chapters, ~600–1000 words each.
- "novel" / unspecified → 8–14 chapters, ~1200–2000 words each.
- Tone/POV/setting: infer from the premise; don't ask unless the premise is too thin to infer from.

Do not offer to generate cover, character, or scene art — this skill has no image-generation tool.
Images are optional in the format; omit them unless the user supplies actual image files to place
under `images/`.

## 2. Pick the id and output folder

- Derive `id` as a clean kebab-case slug of the title: lowercase, spaces/punctuation collapsed to
  single hyphens, no leading/trailing hyphens (e.g. "The Rain Road" → `the-rain-road`). Keep it
  already-normalized so it's stable — the app re-slugifies on import and treats re-import of the same
  `id` as a replacement of the existing novel.
- Output to `novels/<id>/` at the repo root (sibling to the bundled `sample/` folder). Create the
  directory if `novels/` doesn't exist yet. If `novels/<id>/` already exists, ask before overwriting —
  it may be a novel the user is mid-editing.

## 3. Manifest rules (`novels/<id>/manifest.json`)

Required fields:

- `schemaVersion`: must be exactly `1`.
- `id`: the slug from step 2, non-empty.
- `title`: non-empty display title.
- `chapters`: non-empty ordered array of `{ "title": string, "file": "chapters/NNN.md" }`, in reading
  order. Every `file` must exist on disk — the importer silently **drops** chapters whose file is
  missing (no error), and if every chapter gets dropped the whole import fails with "no chapters
  found." Never list a chapter file you haven't written.

Optional fields — include only when they add real value, and only reference assets that actually
exist (a path to a missing file is silently dropped by the importer, not an error, so a typo just
produces a quietly worse result rather than a visible one):

- `author`, `description`, `tags` (string array).
- `cover`: path to an image under `images/`, e.g. `images/cover.png`. Omit entirely if no image file
  exists — the app renders a clean initial-letter placeholder instead, which is expected and fine.
- `characters`: array of `{ "name": string, "image"?: string, "description"?: string }`. Same
  omit-if-no-file rule for `image`.
- `scenes`: array of `{ "image": string, "chapter"?: string, "caption"?: string }` — reference/concept
  art for a chapter. Distinct from `characters[].image` (a portrait). `image` is required and the same
  omit-if-no-file rule applies. `chapter` must equal one chapter's exact `file` value to tag the scene
  to that chapter only — get this exact or the tag is silently ignored and the scene falls back to
  being treated as untagged (shown for every chapter). Leave `chapter` out on purpose for art that
  isn't chapter-specific (e.g. a map, a cast portrait). `caption` is optional short text for the image.
  Scenes surface in the reader's per-chapter gallery (the Gallery tab of the tap-up sheet) alongside any
  inline `![alt](path)` images from that chapter — inline images are pulled out of the running text
  into the same gallery, so use inline images and scenes interchangeably for chapter artwork.

Use `sample/the-rain-road/manifest.json` as a concrete reference if you want to see a filled-in
example, including a tagged `scenes` entry.

## 4. Chapter Markdown (`novels/<id>/chapters/NNN.md`)

Number files zero-padded and sequential: `001.md`, `002.md`, ... The reader (`markdown-it` through
`src/screens/reader/reader.helpers.ts`) only understands a specific subset — **anything outside this
subset is silently dropped from the rendered chapter, not shown as an error**, so avoid it entirely:

**Supported (use freely):**
- Headings (`#`, `##`, ...)
- Paragraphs, separated by one blank line
- `**bold**`, `*italic*`, `` `inline code` ``
- Blockquotes (`>`), including nested blockquotes
- Bullet and ordered lists — **flat only**; nested/indented sub-lists are not rendered as nesting
- Horizontal rules (`---`)
- Images: `![alt](relative/path)`, resolved relative to the chapter file itself (e.g. from
  `chapters/002.md`, `../images/rain.png` points at `images/rain.png`). A paragraph containing only a
  single image renders as a full block image; an image alongside text renders inline.

**Not supported — do not use them, content silently vanishes:**
- Fenced code blocks / indented code blocks
- Tables
- Nested lists (they parse but only the top-level items reach the reader)

`[links](url)` are safe to write but render as plain text (no underline/tap-through) — fine
structurally, just don't rely on them looking like a link.

## 5. Finish and hand off

After writing all files, list what was created (folder path, chapter count, word-count estimate,
whether cover/characters were included, and how many scenes were added — tagged to a chapter vs. left
untagged/global) and tell the user to run `/novel-package novels/<id>` (or just ask you to package it)
to validate and compress it into a `.novel` file.
