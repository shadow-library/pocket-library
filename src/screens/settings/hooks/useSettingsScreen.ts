/**
 * Importing npm packages
 */
import { useRouter } from 'expo-router';

/**
 * Importing user defined packages
 */
import { content } from '@/core/content';
import type { ReaderFontFamily } from '@/core/theme';
import type { DefaultThemeChoice, LibrarySort } from '@/core/types/app-settings.types';
import { useAppSettingsStore } from '@/stores/use-app-settings-store';

/**
 * Defining types
 */

export type SettingsScreenModel = {
  typefaceLabel: string;
  fontSizeLabel: string;
  themeLabel: string;
  sortLabel: string;
  keepAwake: boolean;
  cycleTypeface: () => void;
  cycleFontSize: () => void;
  cycleTheme: () => void;
  cycleSort: () => void;
  setKeepAwake: (value: boolean) => void;
  openAbout: () => void;
};

/**
 * Declaring the constants
 */

const THEME_CHOICES: DefaultThemeChoice[] = ['system', 'light', 'sepia', 'dark'];
const FONT_SCALES = [0.9, 1, 1.1, 1.2];
const BASE_PT = 17;

const THEME_LABEL: Record<DefaultThemeChoice, string> = {
  system: content.settings.themeSystem,
  light: content.reader.reading.themeWhite,
  sepia: content.reader.reading.themeSepia,
  dark: content.reader.reading.themeDark,
};

const TYPEFACE_LABEL: Record<ReaderFontFamily, string> = {
  roboto: content.reader.settings.fontRoboto,
  inter: content.reader.settings.fontInter,
};

function next<T>(list: readonly T[], current: T): T {
  const index = list.indexOf(current);
  return list[(index + 1) % list.length];
}

export function useSettingsScreen(): SettingsScreenModel {
  const router = useRouter();
  const settings = useAppSettingsStore();

  return {
    typefaceLabel: TYPEFACE_LABEL[settings.defaultTypeface],
    fontSizeLabel: `${Math.round(BASE_PT * settings.defaultFontScale)} pt`,
    themeLabel: THEME_LABEL[settings.defaultTheme],
    sortLabel: settings.librarySort === 'recent' ? content.library.sortLastRead : content.library.sortTitle,
    keepAwake: settings.keepAwake,
    cycleTypeface: () => settings.update({ defaultTypeface: settings.defaultTypeface === 'roboto' ? 'inter' : 'roboto' }),
    cycleFontSize: () => settings.update({ defaultFontScale: next(FONT_SCALES, settings.defaultFontScale) }),
    cycleTheme: () => settings.update({ defaultTheme: next(THEME_CHOICES, settings.defaultTheme) }),
    cycleSort: () => settings.update({ librarySort: (settings.librarySort === 'recent' ? 'title' : 'recent') as LibrarySort }),
    setKeepAwake: (value) => settings.update({ keepAwake: value }),
    openAbout: () => router.push('/about'),
  };
}
