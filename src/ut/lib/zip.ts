import JSZip from "jszip";

export interface ZipEntryInfo {
  path: string;
  size: number;
  compressedSize: number;
  directory: boolean;
  date?: Date;
}

/**
 * Reads the *real* file listing from a ZIP archive in the browser.
 * The archive is only read, never modified or re-uploaded.
 */
export async function readZipEntries(file: File, limit = 300): Promise<ZipEntryInfo[]> {
  const zip = await JSZip.loadAsync(file);
  const entries: ZipEntryInfo[] = [];
  zip.forEach((path, entry) => {
    if (entries.length >= limit) return;
    const internal = entry as JSZip.JSZipObject & {
      _data?: { uncompressedSize?: number; compressedSize?: number };
    };
    entries.push({
      path,
      size: internal._data?.uncompressedSize ?? 0,
      compressedSize: internal._data?.compressedSize ?? 0,
      directory: entry.dir,
      date: entry.date instanceof Date ? entry.date : undefined,
    });
  });
  return entries.sort((a, b) => a.path.localeCompare(b.path));
}
