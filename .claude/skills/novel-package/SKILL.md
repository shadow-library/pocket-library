---
name: novel-package
description: Validate a novel source folder against Pocket Library's manifest rules and compress it into a .novel package via scripts/make-novel.mjs. Use when the user wants to package, compress, build, export, zip, or "make importable" a novel/story for Pocket Library, or after the novel-author skill finishes drafting content. Triggers include "package this novel", "compress into .novel", "build the novel file", "turn this folder into a .novel", "/novel-package".
---

# Novel Package

Turns a novel source folder (manifest.json + chapters + optional images, in the shape written by the
`novel-author` skill or authored by hand) into an importable `.novel` file. The actual archive step is
just `bun run make:novel <sourceDir>` (`scripts/make-novel.mjs`, a thin zip wrapper) — the value this
skill adds is validating the folder **before** zipping, against the exact rules Pocket Library's
importer enforces in `src/core/services/import.service.ts`. Re-check that file if behavior here seems
stale; it is the source of truth, not this skill.

## 1. Locate the source folder

Default to `novels/<id>/` if the user names an id or points at a folder there; otherwise use the path
they give you. Confirm `manifest.json` exists at its root before doing anything else — if not, stop
and say so (this isn't a novel source folder).

## 2. Validate before zipping

Read `manifest.json` and check, in order:

1. **Valid JSON.** If it doesn't parse, stop — report the parse error.
2. `schemaVersion === 1` exactly. Anything else is rejected by the importer outright.
3. `id` and `title` are non-empty strings.
4. `chapters` is a non-empty array. For every entry:
   - `file` is a non-empty string, and that file **exists on disk** relative to the folder root.
   - Any chapter whose file is missing gets **silently dropped** by the importer (not an error) — if
     you find one, tell the user and ask whether to fix the path or remove the entry, since if this
     drops *every* chapter the import will fail with "no chapters."
5. If present, `cover` and each `characters[].image` point at files that exist. A missing one isn't
   fatal (the app just falls back to a letter placeholder), but flag it — it's almost always a typo,
   not intentional.
6. If present, each `scenes[].image` points at a file that exists — same non-fatal-but-flag-it rule as
   `cover`/character images (a missing scene image is silently dropped from the novel entirely). For
   each `scenes[].chapter` that is set, confirm it exactly equals some `chapters[].file` value. A
   `chapter` that doesn't match any chapter is **not an error** — the importer silently treats the
   scene as untagged, so it will show up under *every* chapter's scene gallery instead of just the
   intended one. Flag any mismatch; it's almost always a typo the user wants fixed, not a novel-wide
   scene.
7. Skim each listed chapter file for constructs the reader can't render — fenced/indented code blocks
   and tables are silently dropped from output, and nested lists silently flatten. Flag any hits so
   the user can fix them before the "novel looks like it's missing a paragraph" surprise happens after
   import.
8. For each `![alt](path)` inline image in a chapter, resolve it relative to that chapter's own
   location and confirm the target file exists (the reader does the same relative resolution at read
   time; a broken path just renders nothing). These are separate from `scenes[].image` — inline images
   render as part of the chapter text; scenes (and character portraits) surface in a tap-to-reveal
   thumbnail bar in the reader, opening full-screen on tap.

Report all findings together. If anything in 1–4 is a blocking error, stop and ask before packaging.
Non-blocking findings (5–8) are warnings — mention them, then proceed unless the user wants to fix
first.

## 3. Package

Run:

```sh
bun run make:novel <sourceDir> [outDir]
```

`outDir` defaults to the current working directory. This writes `<id>.novel` (a zip, `id` taken from
the manifest) — matches `*.novel` in `.gitignore`, so it's a build artifact, not something to commit.

## 4. Report

State the output path, file size, chapter count, and whether cover/characters/scenes were included
(and how many scenes are chapter-tagged vs. untagged/global). If the user is testing on-device, remind
them the file just needs to reach the device (AirDrop, cable, etc.) and be opened via the library
screen's import action — Pocket Library validates package *contents*, not the file extension.
