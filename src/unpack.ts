import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import * as tar from "tar";
import { isUnsafeEntryPath, safeJoin } from "./files.js";
import type { SkippedFile, UnpackResult } from "./types.js";

export type UnpackOptions = {
  archivePath: string;
  destination: string;
  force?: boolean;
};

export async function unpackCapsule(options: UnpackOptions): Promise<UnpackResult> {
  const archivePath = path.resolve(options.archivePath);
  const destination = path.resolve(options.destination);
  const entries: string[] = [];
  const skipped: SkippedFile[] = [];

  await mkdir(destination, { recursive: true });
  await assertSafeArchive(archivePath);

  await tar.x({
    file: archivePath,
    cwd: destination,
    preservePaths: false,
    filter(entryPath) {
      if (isUnsafeEntryPath(entryPath)) {
        skipped.push({ path: entryPath, reason: "unsafe path" });
        return false;
      }

      const target = safeJoin(destination, entryPath);
      if (existsSync(target) && !options.force) {
        skipped.push({ path: entryPath, reason: "target exists; pass --force to overwrite" });
        return false;
      }

      entries.push(entryPath);
      return true;
    }
  });

  return { destination, entries, skipped };
}

async function assertSafeArchive(archivePath: string): Promise<void> {
  const unsafe: string[] = [];
  await tar.t({
    file: archivePath,
    onentry(entry) {
      if (isUnsafeEntryPath(entry.path)) {
        unsafe.push(entry.path);
      }
    }
  });

  if (unsafe.length > 0) {
    throw new Error(`capsule contains unsafe entries: ${unsafe.join(", ")}`);
  }
}

