# Pocket Library

A fully offline mobile reader for locally imported novels, built with Expo (SDK 57) and Expo Router.

Import a single self-contained **novel package**, and Pocket Library extracts it into the app's
private storage and makes it available offline forever. There is no backend, no account, and no
network access — everything works on-device after import.

## Features

- **Local library** — every imported novel in one place, sorted by most recently opened.
- **Novel details** — cover, author, tags, an expandable synopsis, a chapter list, and clickable
  cover + character portraits (tap any image to view it full-screen).
- **Focused reader** — immersive Markdown chapters with no chrome until you tap; a tap slides up a
  bottom sheet with a chapter scrubber and a bottom icon bar that switches between three tabs —
  Contents, Display, and Gallery — plus a natural "Next chapter" hand-off at the end of each chapter.
- **Chapter gallery** — the sheet's Gallery tab shows the novel's character portraits plus the
  chapter's own images and scene art; tap any thumbnail to view it full-screen.
- **Comfortable reading** — adjustable font size, a choice of reading fonts, and light / dark /
  sepia reading themes.
- **Remembers your place** — the last novel, chapter, and scroll position are restored on relaunch.
- **Private by design** — imported chapters, covers, and images live only in the app's private
  document directory. They never appear in the gallery, Photos, Downloads, or any public media
  location, and no media-library permission is requested.

## Running the app

Bun is used for all commands.

```sh
bun install
bunx expo start        # then press i / a, or scan with Expo Go
# or target a platform directly:
bun run ios
bun run android
```

Type-check and lint:

```sh
bun run typecheck      # tsc --noEmit
bun run lint
```

## The `.novel` package format

A novel package is a **ZIP archive** with the extension `.novel`. Any extension is accepted on
import — the package is validated by its contents, not its name.

```
manifest.json                # required, at the archive root
cover.png                    # optional
chapters/001.md, 002.md, …   # Markdown; a blank line separates paragraphs
images/…                     # cover, character, and inline chapter images
```

Paths inside `manifest.json` are relative to the archive root. Inline image paths inside a chapter's
Markdown are relative to that chapter file (e.g. `![alt](../images/rain.png)`).

### `manifest.json`

```json
{
  "schemaVersion": 1,
  "id": "the-rain-road",
  "title": "The Rain Road",
  "author": "Jane Doe",
  "description": "A short demo novel.",
  "cover": "images/cover.png",
  "tags": ["demo", "fantasy"],
  "characters": [
    { "name": "Elen", "image": "images/elen.png", "description": "A traveler." }
  ],
  "scenes": [
    { "image": "images/rain.png", "chapter": "chapters/002.md", "caption": "The road, soaked through by the storm." }
  ],
  "chapters": [
    { "title": "Chapter 1: Arrival", "file": "chapters/001.md" },
    { "title": "Chapter 2: The Road", "file": "chapters/002.md" }
  ]
}
```

| Field           | Required | Notes                                                            |
| --------------- | -------- | ---------------------------------------------------------------- |
| `schemaVersion` | yes      | Must be `1`.                                                     |
| `id`            | yes      | Stable, unique id. Re-importing the same id replaces the novel. |
| `title`         | yes      | Display title.                                                  |
| `chapters`      | yes      | Ordered array; array order is the reading order.               |
| `cover`         | no       | Path to a cover image within the package.                       |
| `author`, `description`, `tags`, `characters` | no | Shown on the novel detail screen. |
| `scenes`        | no       | Reference/concept art — not a character portrait, not an inline chapter image. See below. |

Chapters are Markdown and support headings, **bold**, *italic*, blockquotes, ordered/unordered
lists, and horizontal rules. Inline images (`![alt](path)`) are supported but do **not** render in
the reading flow — they are collected into the chapter gallery instead (see below).

#### `scenes`

Each entry is `{ "image": string, "chapter"?: string, "caption"?: string }`:

- `image` (required) — path to the image within the package, same convention as `cover`.
- `chapter` (optional) — the exact `file` value of one entry in `chapters`. Tags this scene to that
  chapter only. Omit it and the scene shows up under **every** chapter instead.
- `caption` (optional) — short text shown under the image.

While reading, tapping the page slides up the reader sheet; its **Gallery** tab shows the novel's
character portraits plus the current chapter's inline images and scenes as thumbnails, each opening
full-screen on tap. Inline chapter images
(`![alt](path)`, resolved relative to the chapter file) and scenes therefore share the same gallery —
scenes are novel-level reference art tagged to chapters, inline images are authored into a chapter's
Markdown. Neither appears in the running chapter text.

## Building a package

Author a source folder that mirrors the layout above, then zip it with the bundled script:

```sh
# node scripts/make-novel.mjs <sourceDir> [outDir]
bun run make:novel path/to/my-novel

# or build the bundled sample (writes the-rain-road.novel to the current directory):
bun run make:sample
```

A ready-to-edit sample lives in [`sample/the-rain-road/`](./sample/the-rain-road). Load the resulting
`.novel` file onto your device/simulator and import it from the library screen.

## Project structure & conventions

Architecture and code conventions are documented in [`AGENTS.md`](./AGENTS.md). In short: thin Expo
Router routes in `src/app` delegate to `src/screens`; cross-cutting runtime logic lives in
`src/core` (`infrastructure → repositories → services` as class singletons); shared client state
uses Zustand stores in `src/stores`.
