/**
 * Importing npm packages
 */
import * as DocumentPicker from 'expo-document-picker';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type PickedFile = {
  uri: string;
  name: string;
  size: number | null;
  mimeType: string | null;
};

export type PickResult = { status: 'picked'; file: PickedFile } | { status: 'canceled' };

/**
 * Declaring the constants
 */

class DocumentPickerService {
  // Accept any file type — `.novel` packages report inconsistent mime types across platforms, so the
  // package is validated by content during import rather than by the picker filter.
  async pickNovelPackage(): Promise<PickResult> {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true, multiple: false });
    if (result.canceled) return { status: 'canceled' };
    const asset = result.assets[0];
    if (asset === undefined) return { status: 'canceled' };
    return { status: 'picked', file: { uri: asset.uri, name: asset.name, size: asset.size ?? null, mimeType: asset.mimeType ?? null } };
  }
}

export const documentPickerService = new DocumentPickerService();
