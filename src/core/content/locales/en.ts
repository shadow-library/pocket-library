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

export const en = {
  library: {
    title: 'Library',
    importCta: 'Import novel',
    importing: 'Importing…',
    continueReading: 'Continue reading',
    empty: {
      title: 'Your library is empty',
      body: 'Import a .novel package to start reading offline.',
    },
    chapterProgress: (chapter: number, total: number) => `Chapter ${chapter} of ${total}`,
    removeConfirm: {
      title: 'Remove novel?',
      body: 'This deletes the novel and its saved progress from this device.',
      confirm: 'Remove',
      cancel: 'Cancel',
    },
  },
  novel: {
    byAuthor: (author: string) => `by ${author}`,
    unknownAuthor: 'Unknown author',
    startReading: 'Start reading',
    continueReading: 'Continue reading',
    chaptersHeading: 'Chapters',
    charactersHeading: 'Characters',
    chapterCount: (count: number) => (count === 1 ? '1 chapter' : `${count} chapters`),
    remove: 'Remove from library',
  },
  reader: {
    settings: {
      title: 'Reading settings',
      fontSize: 'Font size',
      theme: 'Theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeSepia: 'Sepia',
    },
    assets: {
      charactersHeading: 'Characters',
      scenesHeading: 'Scenes for this chapter',
      close: 'Close',
      hint: 'Tap the page to view characters and scenes',
    },
    nextChapter: 'Next chapter',
    finishedTitle: 'You reached the end',
    finishedBody: 'That was the last chapter of this novel.',
    backToLibrary: 'Back to library',
  },
  import: {
    errors: {
      invalidPackage: 'That file is not a valid novel package.',
      missingManifest: 'The package is missing its manifest.json.',
      malformedManifest: 'The package manifest is malformed or unsupported.',
      noChapters: 'This novel has no chapters to read.',
      failed: 'Could not import the novel. Please try another file.',
    },
  },
  common: {
    retry: 'Retry',
    cancel: 'Cancel',
    loading: 'Loading…',
    notFound: 'We could not find that novel.',
  },
} as const;
