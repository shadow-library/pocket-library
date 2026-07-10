# Pocket Library — Repository Instructions

Pocket Library is a fully offline Expo Router app for reading locally imported novels. There is no
backend, no accounts, no cloud sync, and no online content fetching. A novel is imported once from a
single self-contained package file and then lives entirely in the app's private storage.

## Expo Has Changed

Expo SDK 57 changed many module APIs. Read the exact versioned docs at
https://docs.expo.dev/versions/v57.0.0/ before writing any code that touches an Expo module. Do not
rely on memory of older SDKs — confirm the current API (imports, method names, return shapes) in the
v57 reference first.

## Product Constraints

- Everything works offline after a novel is imported. Never add network calls, remote fetching,
  auth, or cloud sync.
- Imported assets (chapters, cover, character images, other assets) must stay **private to the app**.
  Store them only under the app's private document directory (`expo-file-system` `Paths.document`).
  Never write to the gallery, Photos, Downloads, or any public media location, and do not use
  `expo-media-library`.
- Reading progress (last opened novel, chapter, and scroll position) must persist across app
  restarts.

## Commands

Use Bun for all project commands.

- Install dependencies with `bun install`.
- Run package scripts with `bun run <script>`.
- Run Expo commands with `bunx expo <command>`.
- Add Expo native modules with `bunx expo install <module>` so versions stay SDK-compatible.
- Run TypeScript checks with `bunx tsc --noEmit`.
- Trigger cloud builds with `bun run build:development`, `bun run build:preview`, or
  `bun run build:production` (wraps `eas build`, profiles defined in `eas.json`). The project is
  linked to EAS project `093b574e-0bca-4942-b87d-d93de73188c3` (`@shadow-apps/pocket-library`) via
  `extra.eas.projectId` and `owner` in `app.config.ts` — never change those without the user's
  explicit instruction, since they determine which cloud account/project builds are billed to and
  delivered under. Triggering a build queues a real, potentially billed cloud job; confirm with the
  user before running one, and let them choose the profile if unspecified.
- Build and side-load a production build onto a connected Android device with
  `bun run build:production:install`. It builds locally (no cloud queue) with the `production-apk`
  profile — same signing/versioning as `production`, but packaged as an installable `.apk` instead of
  the store's `.app-bundle` — then runs `adb install -r` against whatever device `adb` currently sees.
  Requires exactly one connected/authorized device or emulator; the local build itself is real CPU
  work (several minutes), so confirm with the user before running it, same as any other build trigger.
  A device that already has a `development`/`preview` build installed must be uninstalled first
  (`adb uninstall com.shadowapps.pocketlibrary`) — Android blocks installing over a package whose
  existing signature doesn't match, and dev/preview/production builds are signed differently.
- App identity/config lives in `app.config.ts`, not `app.json` (there is no `app.json` in this repo).
  `name` is computed from `EAS_BUILD_PROFILE`, which EAS sets automatically during a build: `Pocket
  Library Dev` for `development`, `Pocket Library Preview` for `preview`, plain `Pocket Library` for
  everything else (`production`, `production-apk`, and local `expo start`/`expo run:*` where the
  variable is unset). Add new profile names to `APP_NAME_BY_PROFILE` there if you add more.

Do not use `npm`, `npx`, `yarn`, or `pnpm` unless the user explicitly asks for them.

## Novel Authoring Skills

Two agent skills cover writing and packaging novel content for this app. They are plain Markdown
instruction files, not a Claude-specific mechanism — any coding agent (Codex, Claude Code, or
otherwise) should read the relevant file in full and follow it when the matching request comes in,
whether or not that agent has a native "skill" concept:

- `.claude/skills/novel-author/SKILL.md` — writes a novel's source content (manifest.json, Markdown
  chapters, optional characters) into `novels/<id>/`, following Pocket Library's package format. Use
  when asked to write, draft, or generate a story/novel for this app.
- `.claude/skills/novel-package/SKILL.md` — validates a `novels/<id>/` source folder against the
  importer's actual rules (`src/core/services/import.service.ts`) and compresses it into a `.novel`
  file via `bun run make:novel`. Use when asked to package, compress, build, or export a novel.

`novels/<id>/` source folders are committable content. The resulting `<id>.novel` archive is a build
artifact (already covered by `*.novel` in `.gitignore`), not something to commit.

## Project Structure

This is an Expo Router React Native app. Keep folder ownership clear so every file has an obvious
home.

```text
src/
├── app/                    # Expo Router route/layout files only
├── screens/                # Route-private screen implementation
├── features/               # Shared domain logic grouped by business capability
├── components/             # Shared domain-agnostic UI
├── hooks/                  # Shared domain-agnostic hooks
├── stores/                 # App-wide Zustand stores
├── providers/              # App-wide React providers
└── core/                   # Cross-cutting runtime layer + shared globals
    ├── services/           # Business/orchestration services (class singletons)
    ├── repositories/       # Data access — local storage, filesystem (class singletons)
    ├── infrastructure/     # External SDK/platform integrations (class singletons)
    ├── types/              # Shared type declarations; grouped per entity
    ├── theme/              # Design tokens
    └── content/            # User-facing strings (locale dictionaries)
        ├── index.ts        # Re-exports the active locale as `content`
        └── locales/        # One file per locale, each a `const ... as const`
```

### `src/app`

- `src/app` contains Expo Router route and layout files only. Route files may use default exports
  because Expo requires them.
- Route files may hold screen implementation only when they still have exactly one component, use no
  more than two hooks, and stay easy to scan. Otherwise render a screen from `src/screens`.
- Move code to `src/screens`, `src/features`, `src/core`, or `src/providers` when a route grows a
  second meaningful section, needs more than two hooks, or starts carrying business/service logic.

### `src/screens`

- `src/screens` contains route-private screen implementation. A screen may hold JSX, local state,
  event handlers, local constants, and one to two hook calls when it stays easy to read.
- Extract to `screens/<screen>/components` only when repeated JSX, multiple sections, or nested
  interactions make the screen hard to scan.
- Extract to `screens/<screen>/hooks` when hook logic distracts from rendering or a component would
  otherwise need more than two hook calls. Prefer a single `use<Screen>Screen` hook that bundles the
  screen's state and handlers so the route/screen component stays within the hook limit.
- Code inside one screen folder must not be imported by another screen. Promote shared code instead.
- Use `screens/<screen>/<screen>.constants.ts` for constants specific to one screen and
  `screens/<screen>/<screen>.helpers.ts` for pure helpers specific to one screen. Keep them private
  to that screen folder. Create these files only when inline values or functions hurt readability.

### Shared Code

- Use `src/components` for shared, domain-agnostic presentational UI.
- Use `src/hooks` for shared, domain-agnostic hooks. When shared components under
  `src/components/<domain>/` need domain-specific hooks, co-locate them in
  `src/components/<domain>/hooks/`, one hook per file, not imported from outside that domain.
- Use `src/features/<domain>` for shared business logic tied to a domain. Feature constants live in
  `src/features/<domain>/<domain>.constants.ts`; feature helpers in `<domain>.helpers.ts`.
- Use `src/core` for the cross-cutting runtime layer plus shared globals (see below).
- Use `src/stores` for truly app-wide Zustand stores; domain-scoped stores live under
  `src/features/<domain>/stores`.
- Use `src/providers` for app-wide React context providers and provider hooks.
- Promote code only when two or more screens use it. Keep code local when only one screen uses it.
- Shared helper files must stay pure: no React state, hooks, navigation, SDK calls, mutation of
  inputs, or UI.
- Do not create catch-all files such as `helpers.ts`, `constants.ts`, or `utils.ts` at the root of
  `src`. Name files by owner and purpose.

### `src/core`

- `src/core` holds the app's cross-cutting runtime layer, split into three runtime subfolders —
  `services`, `repositories`, and `infrastructure` — plus shared-globals subfolders `types`,
  `theme`, and `content`.
- Use `src/core/infrastructure` for external SDK and platform integrations: filesystem drivers,
  document picker, archive/zip handling, and any module that wraps a third-party or platform
  boundary.
- Use `src/core/repositories` for data access. Repositories own reads/writes against a backing store
  (the private filesystem, JSON index files) and expose typed domain methods. Repositories depend on
  infrastructure, never the other way around.
- Use `src/core/services` for business and orchestration logic. Services compose repositories and
  infrastructure, enforce domain rules, and expose the API that screens, stores, and providers call.
- Every runtime module under `src/core/{infrastructure,repositories,services}` must be a class. Each
  file defines exactly one class and exports a default singleton instance of that class. Do not
  export the class for direct instantiation; the singleton is the public surface.
- File naming uses dotted suffixes that signal role: `*.service.ts` for services and SDK/platform
  service singletons under `infrastructure`, `*.repository.ts` for repositories, and `*.types.ts`
  for type-only files.
- Singleton exports use camelCase named after the class — `ImportService` is exported as
  `importService`. Each file exports the singleton (and any types the class surfaces), never the
  class constructor.
- Inject dependencies (other singletons) via constructor parameters with defaults resolving to the
  existing singletons, so tests can substitute fakes.
- Keep React out of `src/core/{infrastructure,repositories,services}`. No JSX, hooks, or context.
- Respect the dependency direction: `infrastructure` -> `repositories` -> `services`. A repository
  may not import a service; infrastructure may not import a repository or service.
- Do not declare standalone module-level functions in these files. Every callable lives on a class;
  private helpers become `private` methods. Cross-cutting pure helpers belong on `UtilityService`
  (`src/core/infrastructure/utility.service.ts`), kept dependency-free and injected via constructor.
  Module-level `const` values for static constants are still allowed.

### `src/core/types`

- Use `src/core/types` for shared types, grouped per entity in `*.types.ts` files (one file per
  domain entity). Repositories, services, stores, and screens import shapes from
  `src/core/types/<entity>.types.ts` rather than redeclaring them.
- Service-local contract types (request/response shapes, in-memory state) may live with the service
  when they are not the persisted shape and not consumed outside that service's callers.

### `src/core/content`

- Use `src/core/content` for user-facing strings. Each locale lives in
  `src/core/content/locales/<lang>.ts` and exports a single `const ... as const`.
- `src/core/content/index.ts` re-exports the active locale as `content`. Consumers import `content`
  from `@/core/content` and read dotted paths. Do not import locale files directly from outside
  `src/core/content`. Group keys by feature or screen, then by purpose.

## Expo and UI Rules

- Build a clean, focused reading experience optimized for long sessions. Prefer calm typography,
  comfortable line-height, and generous reading margins over dense chrome.
- Read colors, spacing, radii, and typography from `src/core/theme` design tokens. Avoid raw colors
  or magic dimensions in components except for fixed asset requirements.
- Use a dynamic StyleSheet pattern whenever styles depend on theme values: build styles from a
  `createStyles(theme)` function and call it inside the component after reading the theme.
- Support the reader's light, dark, and sepia reading themes and the app's system light/dark chrome.
  Never rely on color alone to communicate state; pair it with text, iconography, or position.
- Preserve safe-area handling on every screen. Interactive controls need clear labels, 48dp minimum
  touch targets, and accessible roles/labels where visual text is not enough.
- Every substantial user-facing flow (import, open novel, read chapter) must include appropriate
  loading, empty, and error states.
- Keep filesystem, picker, and archive SDK calls out of components. UI calls store actions or
  `src/core` service singletons.
- Do not use deprecated React Native or Expo APIs. If you touch a file using one, replace it with the
  current documented v57 API when the replacement is local and low risk.
- Prefer maintained Expo modules and existing app components over unmaintained third-party packages
  or custom native bridges. Do not introduce new UI, navigation, styling, or state libraries without
  a clear need and existing-project fit.
- Keep layout responsive across small phones, large phones, tablets, light/dark themes, and dynamic
  font scaling. Keep user-facing copy concise, actionable, and sentence-style.

## State Management Rules

- Use local React state (`useState`, `useReducer`) for state owned by one component or screen.
- Use React Context only for app-wide dependency/provider boundaries such as theme or SDK setup.
- Use Zustand for shared client state used by multiple screens (the imported library, reader
  settings). Store files live under `src/stores` (app-wide) or `src/features/<domain>/stores`.
- Keep async SDK/filesystem work in `src/core`. Zustand actions may orchestrate service calls, but
  SDK details stay outside the store. Model loading and error state explicitly for async actions.
- Store files use kebab-case names such as `use-library-store.ts` and export one hook named like
  `useLibraryStore`. Select only the state/actions each component needs.
- Keep store state serializable. Do not store navigation objects, timers, promises, React
  components, or large binary values in Zustand.
- Persist Zustand state only when product behavior requires it (reader settings, progress). Persisted
  stores must document what is persisted and how reset is handled.

## TypeScript File Structure

Every TypeScript or TSX file must include the same section comments used across the repo:

```ts
/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
```

- External package imports go under `Importing npm packages`.
- Local app imports go under `Importing user defined packages`.
- Type and interface declarations go under `Defining types`.
- Module-level constants go under `Declaring the constants`.

Keep section comments even when a section is temporarily empty.

## TypeScript and Export Rules

- Keep TypeScript strict. Avoid `any`, `ts-ignore`, broad casts, and unchecked nullable access
  unless there is a documented reason. Use `unknown` for caught errors and external input, then
  narrow before reading fields.
- Use named exports for components, hooks, providers, services, constants, and types. Use default
  exports only where Expo Router or ambient module declarations require them.
- Every `.tsx` file must export exactly one React component. It may define up to two small private
  sub-components and one private hook in the same file only when used exclusively by that component,
  declared below the main export and not exported.
- A `.tsx` file must not exceed 500 lines. Extract sub-components, hooks, constants, helpers, or
  styles before crossing that limit.
- Each React component may call only one or two hooks total (React, Expo Router, theme, Zustand, and
  custom hooks all count). If more are needed, move behavior into one well-named custom hook or split
  the UI.
- Prefer `type` aliases for object shapes. Use discriminated unions for state machines, async result
  states, and variants instead of loose boolean combinations. Avoid non-null assertions unless the
  invariant is obvious locally.
- Keep props types close to their component unless shared by more than one file. Export shared types
  from the domain that owns them. Avoid magic strings and numbers; promote meaningful values to
  typed constants. Avoid circular imports.
- Do not leave dead code, commented-out code, unused exports, debug logs, or TODOs without an owner
  and reason.

## Formatting and Code Aesthetics

- Prefer single-line statements, props, imports, object literals, arrays, and JSX when they stay
  readable and do not exceed 180 characters. Split at 180; use more lines only for readability or
  nested JSX. Indent with 2 spaces and end statements with semicolons.
- Single-line `if` with one statement needs no braces: `if (condition) return value;`. Prefer early
  returns and guard clauses over nested conditionals.
- Keep related JSX text together as natural text. Do not use `{' '}` just to insert spaces; restructure
  copy or move inline actions into separate styled text components instead.
- Keep styles at the bottom of the file, after the component, private sub-components, hook, and
  helpers. Put all styles in `StyleSheet.create`; do not add inline style objects inside JSX. Write
  style entries as multi-line objects, one property per line.
- For one-off theme colors, put the themed value in the dynamic StyleSheet instead of writing
  `{ color: theme... }` inside JSX. Preserve the section comments; do not add decorative comments or
  visual separators. Comment *why*, never *what*.

## Maintainability Rules

- Keep changes scoped to the requested behavior. Do not perform unrelated refactors while
  implementing a feature or fix, and do not revert unrelated modified files.
- Prefer simple, explicit code over clever abstractions. Add abstractions only after duplication or
  complexity proves them necessary.
- Keep domain rules out of presentational components. Components render data and call typed
  callbacks; services own business decisions. Validate external input (imported package contents) at
  service boundaries before it reaches UI or stores.
- Convert SDK, filesystem, and archive errors into typed or readable app-level errors before showing
  them to users.
- Avoid unnecessary `useEffect`; derive values during render when possible. Effects must clean up
  subscriptions, timers, and listeners. Memoize only for correctness or measured cost.
- Prefer current official APIs and project-installed packages. Before adding a dependency, confirm
  the existing stack cannot solve the problem cleanly.

## Verification

- Run `bunx tsc --noEmit` after TypeScript changes.
- Run `bun run lint` after code changes.
- For routing, native config, or app-startup changes, verify with `bunx expo start` or the relevant
  Expo platform command.
- For UI changes, verify light/dark/sepia themes, small-screen layout, touch targets, and dynamic
  font scaling where practical.
- For import/storage changes, verify the imported assets never appear in public media locations and
  that reading progress survives an app restart.
