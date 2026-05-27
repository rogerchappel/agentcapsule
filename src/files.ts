import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { minimatch } from "minimatch";
import { DEFAULT_SECRET_DENY } from "./config.js";
import type { CapsuleConfig, ManifestFile, SkippedFile } from "./types.js";

export type FileSelection = {
  files: ManifestFile[];
  skipped: SkippedFile[];
};

export function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

export function isUnsafeEntryPath(value: string): boolean {
  return value.length === 0 || path.isAbsolute(value) || value.split(/[\\/]+/).includes("..");
}

export function safeJoin(root: string, entryPath: string): string {
  if (isUnsafeEntryPath(entryPath)) {
    throw new Error(`unsafe archive entry: ${entryPath}`);
  }

  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, entryPath);
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`archive entry escapes destination: ${entryPath}`);
  }

  return resolvedPath;
}

export async function selectFiles(root: string, config: CapsuleConfig): Promise<FileSelection> {
  const candidates = await walk(root);
  const files: ManifestFile[] = [];
  const skipped: SkippedFile[] = [];
  let totalBytes = 0;

  for (const candidate of candidates) {
    const rel = toPosixPath(path.relative(root, candidate));
    if (isUnsafeEntryPath(rel)) {
      skipped.push({ path: rel, reason: "unsafe path" });
      continue;
    }

    if (!matchesAny(rel, config.include)) {
      skipped.push({ path: rel, reason: "not included by config" });
      continue;
    }

    if (matchesAny(rel, config.exclude)) {
      skipped.push({ path: rel, reason: "excluded by config" });
      continue;
    }

    if (matchesAny(rel, DEFAULT_SECRET_DENY)) {
      skipped.push({ path: rel, reason: "blocked by default secret denylist" });
      continue;
    }

    const fileStat = await stat(candidate);
    if (fileStat.size > config.maxFileBytes) {
      skipped.push({ path: rel, reason: `exceeds maxFileBytes (${config.maxFileBytes})` });
      continue;
    }

    if (totalBytes + fileStat.size > config.maxTotalBytes) {
      skipped.push({ path: rel, reason: `exceeds maxTotalBytes (${config.maxTotalBytes})` });
      continue;
    }

    const sha256 = createHash("sha256").update(await readFile(candidate)).digest("hex");
    files.push({ path: rel, size: fileStat.size, sha256 });
    totalBytes += fileStat.size;
  }

  files.sort((left, right) => left.path.localeCompare(right.path));
  skipped.sort((left, right) => left.path.localeCompare(right.path));
  return { files, skipped };
}

function matchesAny(filePath: string, patterns: string[]): boolean {
  return patterns.some((pattern) => minimatch(filePath, pattern, { dot: true, matchBase: true }));
}

async function walk(root: string): Promise<string[]> {
  const output: string[] = [];
  const entries = await readdir(root, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      output.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      output.push(fullPath);
    }
  }

  return output;
}

