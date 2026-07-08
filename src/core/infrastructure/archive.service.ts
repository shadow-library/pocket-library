/**
 * Importing npm packages
 */
import { strFromU8, unzipSync } from 'fflate';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type ArchiveEntries = Record<string, Uint8Array>;

/**
 * Declaring the constants
 */

class ArchiveService {
  // Import runs once behind a spinner, so a synchronous unzip keeps the flow simple without a
  // worker dependency that Hermes does not provide.
  unzip(bytes: Uint8Array): ArchiveEntries {
    return unzipSync(bytes);
  }

  decodeText(bytes: Uint8Array): string {
    return strFromU8(bytes);
  }
}

export const archiveService = new ArchiveService();
