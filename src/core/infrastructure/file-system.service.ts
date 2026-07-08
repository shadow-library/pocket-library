/**
 * Importing npm packages
 */
import { Directory, File, Paths } from 'expo-file-system';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

// All reads and writes are scoped to the app's private document directory. Nothing here ever touches
// public media locations, which keeps imported novel assets sandboxed to the app.
class FileSystemService {
  fileExists(relativePath: string): boolean {
    return this.file(relativePath).exists;
  }

  directoryExists(relativePath: string): boolean {
    return this.directory(relativePath).exists;
  }

  fileUri(relativePath: string): string {
    return this.file(relativePath).uri;
  }

  readTextFile(relativePath: string): string {
    return this.file(relativePath).textSync();
  }

  /** Reads raw bytes from an absolute `file://`/content uri (e.g. a freshly picked package). */
  readBytesFromUri(uri: string): Uint8Array {
    return new File(uri).bytesSync();
  }

  readJsonFile<T>(relativePath: string): T | null {
    const target = this.file(relativePath);
    if (!target.exists) return null;
    return JSON.parse(target.textSync()) as T;
  }

  writeTextFile(relativePath: string, content: string): void {
    const target = this.file(relativePath);
    target.create({ intermediates: true, overwrite: true });
    target.write(content);
  }

  writeJsonFile(relativePath: string, value: unknown): void {
    this.writeTextFile(relativePath, JSON.stringify(value));
  }

  writeBytesFile(relativePath: string, bytes: Uint8Array): void {
    const target = this.file(relativePath);
    target.create({ intermediates: true, overwrite: true });
    target.write(bytes);
  }

  deleteFile(relativePath: string): void {
    const target = this.file(relativePath);
    if (target.exists) target.delete();
  }

  deleteDirectory(relativePath: string): void {
    const target = this.directory(relativePath);
    if (target.exists) target.delete();
  }

  private file(relativePath: string): File {
    return new File(Paths.document, ...this.segments(relativePath));
  }

  private directory(relativePath: string): Directory {
    return new Directory(Paths.document, ...this.segments(relativePath));
  }

  private segments(relativePath: string): string[] {
    return relativePath.split('/').filter((segment) => segment.length > 0);
  }
}

export const fileSystemService = new FileSystemService();
