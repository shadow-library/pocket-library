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

class UtilityService {
  /** Filesystem-safe id derived from arbitrary text; falls back to a generated id when empty. */
  slugify(raw: string): string {
    const slug = raw
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug.length > 0 ? slug : this.generateId();
  }

  generateId(): string {
    return `novel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /** Joins path segments with single slashes, ignoring empty and slash-only fragments. */
  joinPath(...parts: string[]): string {
    return parts
      .map((part) => part.replace(/^\/+|\/+$/g, ''))
      .filter((part) => part.length > 0)
      .join('/');
  }

  /** Resolves a link relative to a source file's directory into a package-root-relative path. */
  resolvePath(fromFile: string, relative: string): string {
    if (relative.startsWith('/')) return this.normalize(relative);
    const dir = fromFile.split('/').slice(0, -1);
    return this.normalize([...dir, ...relative.split('/')].join('/'));
  }

  private normalize(path: string): string {
    const out: string[] = [];
    for (const segment of path.split('/')) {
      if (segment === '' || segment === '.') continue;
      if (segment === '..') {
        out.pop();
        continue;
      }
      out.push(segment);
    }
    return out.join('/');
  }
}

export const utilityService = new UtilityService();
