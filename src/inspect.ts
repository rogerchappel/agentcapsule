import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import * as tar from "tar";
import type { CapsuleManifest } from "./types.js";

export async function inspectCapsule(archivePath: string): Promise<CapsuleManifest> {
  const resolvedArchive = path.resolve(archivePath);
  const siblingManifest = resolvedArchive.replace(/\.tar\.gz$/, ".manifest.json");
  if (existsSync(siblingManifest)) {
    return JSON.parse(await readFile(siblingManifest, "utf8")) as CapsuleManifest;
  }

  const chunks: Buffer[] = [];
  await tar.t({
    file: resolvedArchive,
    onentry(entry) {
      if (/^\.agentcapsule\/.+\.manifest\.json$/.test(entry.path)) {
        entry.on("data", (chunk: Buffer) => chunks.push(chunk));
      }
    }
  });

  if (chunks.length === 0) {
    throw new Error("capsule manifest not found in archive or beside archive");
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as CapsuleManifest;
}

