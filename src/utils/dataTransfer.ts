interface FileWithFullPath {
  file: File;
  path: string;
}

export function hasImportableDataTransferItems(items: DataTransferItemList | null): boolean {
  return !!items && Array.from(items).some(item =>
    item.kind === "file" && (item.type === "" || item.type.startsWith("image/") || item.type.includes("zip")),
  );
}

export async function filesFromDataTransferItems(items: DataTransferItemList): Promise<File[]> {
  const files: FileWithFullPath[] = [];
  for (const item of Array.from(items)) {
    if (item.kind !== "file")
      continue;
    const entry = item.webkitGetAsEntry();
    if (entry) {
      files.push(...await filesFromEntry(entry));
    }
    else {
      const file = item.getAsFile();
      if (file) {
        files.push({ file, path: file.name });
      }
    }
  }
  return files
    .sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }))
    .map(({ file }) => file);
}

async function filesFromEntry(entry: FileSystemEntry): Promise<FileWithFullPath[]> {
  if (entry.isFile) {
    const file = await fileFromEntry(entry as FileSystemFileEntry);
    return [{ file, path: entry.fullPath }];
  }
  if (!entry.isDirectory)
    return [];
  const entries = await entriesFromDirectory(entry as FileSystemDirectoryEntry);
  const nested = await Promise.all(entries.map(filesFromEntry));
  return nested.flat();
}

async function fileFromEntry(entry: FileSystemFileEntry): Promise<File> {
  return await new Promise((resolve, reject) => {
    entry.file(resolve, reject);
  });
}

async function entriesFromDirectory(entry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  const reader = entry.createReader();
  const entries: FileSystemEntry[] = [];
  while (true) {
    const batch = await readDirectoryBatch(reader);
    if (batch.length === 0)
      break;
    entries.push(...batch);
  }
  return entries;
}

async function readDirectoryBatch(
  reader: FileSystemDirectoryReader,
): Promise<FileSystemEntry[]> {
  return await new Promise((resolve, reject) => {
    reader.readEntries(resolve, reject);
  });
}
