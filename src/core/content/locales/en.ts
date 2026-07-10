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
  tabs: {
    library: 'Library',
    recent: 'Recent',
    settings: 'Settings',
  },
  library: {
    title: 'Library',
    importCta: 'Import novel',
    importing: 'Importing…',
    sortLastRead: 'Last Read',
    sortTitle: 'Title',
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
    continuePercent: (percent: number) => `Continue · ${percent}%`,
    chaptersHeading: 'Chapters',
    charactersHeading: 'Characters',
    chapterCount: (count: number) => (count === 1 ? '1 chapter' : `${count} chapters`),
    synopsisMore: 'More',
    synopsisLess: 'Less',
    remove: 'Remove from library',
  },
  reader: {
    settings: {
      fontRoboto: 'Roboto',
      fontInter: 'Inter',
    },
    options: {
      prevChapter: 'Previous',
      nextChapter: 'Next',
    },
    tabs: {
      menu: 'Menu',
      reading: 'Reading',
      gallery: 'Gallery',
    },
    reading: {
      theme: 'Theme',
      themeWhite: 'White',
      themeSepia: 'Sepia',
      themeDark: 'Dark',
      typeface: 'Typeface',
      fontSize: 'Font size',
      fontSizeValue: (pt: number) => `${pt} pt`,
      brightness: 'Brightness',
    },
    menu: {
      contents: 'Contents',
      contentsCount: (count: number) => (count === 1 ? '1 chapter' : `${count} chapters`),
      aboutTitle: 'About this',
      aboutSubtitle: 'book',
    },
    positionLabel: (percent: number, chapter: number, title: string) => `${percent}% · Ch. ${chapter} · ${title}`,
    gallery: {
      title: 'Gallery',
      hint: 'Tap any image to view fullscreen',
      thisChapter: 'This chapter',
      charactersHeading: 'Characters',
      chapterImagesHeading: 'Chapter images',
      scenesHeading: 'Scenes',
      empty: 'No images for this chapter.',
    },
    nextChapter: 'Next chapter',
    finishedTitle: 'You reached the end',
    finishedBody: 'That was the last chapter of this novel.',
    backToLibrary: 'Back to library',
  },
  import: {
    title: 'Import Novel',
    dropTitle: 'Drop a .novel file here',
    dropSubtitle: 'Files stay on your device',
    browse: 'Browse files',
    importing: 'Importing',
    steps: {
      unpacking: 'Unpacking archive',
      manifest: 'Reading manifest & metadata',
      chapters: 'Validating chapters',
      assets: 'Loading character assets',
    },
    added: (title: string) => `“${title}” added to library`,
    view: 'View',
    errorTitle: 'Couldn’t open this file',
    errorBody: (name: string) => `“${name}” appears to be corrupted or is missing required contents.`,
    validationReport: 'Validation report',
    retry: 'Retry import',
    chooseDifferent: 'Choose a different file',
    errors: {
      invalidPackage: 'That file is not a valid novel package.',
      missingManifest: 'The package is missing its manifest.json.',
      malformedManifest: 'The package manifest is malformed or unsupported.',
      noChapters: 'This novel has no chapters to read.',
      failed: 'Could not import the novel. Please try another file.',
    },
  },
  recent: {
    title: 'Recent',
    today: 'Today',
    earlier: 'Earlier this week',
    older: 'Older',
    finished: 'Finished',
    entry: (chapter: number, percent: number, when: string) => `Ch. ${chapter} · ${percent}% · ${when}`,
    empty: 'Nothing read yet.',
  },
  settings: {
    title: 'Settings',
    readerDefaults: 'Default reader preferences',
    typeface: 'Typeface',
    defaultFontSize: 'Default font size',
    defaultTheme: 'Default theme',
    themeSystem: 'Match system',
    general: 'General',
    librarySort: 'Library sort',
    keepAwake: 'Keep screen awake while reading',
    aboutRow: 'About Pocket Library',
    version: 'v1.0.0',
  },
  about: {
    title: 'About',
    appName: 'Pocket Library',
    version: 'Version 1.0.0 (build 128)',
    description: 'A quiet, offline-first reader for novels packaged as .novel files. Your books never leave your device.',
    acknowledgements: 'Acknowledgements',
    licences: 'Open-source licences',
    privacy: 'Privacy policy',
    footer: 'Made for readers',
  },
  progress: {
    title: 'Your progress',
    resume: 'Resume',
    chaptersRead: (read: number, total: number) => `${read} of ${total} read`,
    timeSpent: 'time spent',
    streak: 'reading streak',
    streakDays: (days: number) => (days === 1 ? '1 day' : `${days} days`),
    jumpToChapter: 'Jump to chapter',
    done: 'Done',
    chapterLine: (index: number, title: string) => `${index} · ${title}`,
  },
  common: {
    retry: 'Retry',
    cancel: 'Cancel',
    close: 'Close',
    loading: 'Loading…',
    notFound: 'We could not find that novel.',
  },
} as const;
