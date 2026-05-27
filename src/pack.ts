import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as tar from "tar";
import { loadConfig } from "./config.js";
import { selectFiles } from "./files.js";
import { runCommandReceipts } from "./commands.js";
import type { CapsuleManifest, PackResult } from "./types.js";

export type PackOptions = {
  root: string;
  note?: string[];
};

export async function packCapsule(options: PackOptions): Promise<PackResult> {
  const root = path.resolve(options.root);
  const { config, path: configPath } = await loadConfig(root);
  const outDir = path.join(root, ".agentcapsule");
  await mkdir(outDir, { recursive: true });

  const selected = await selectFiles(root, config);
  const receipts = await runCommandReceipts(config.commands, root);
  const notes = [...config.notes, ...(options.note ?? [])];
  const manifest: CapsuleManifest = {
    schemaVersion: 1,
    capsuleName: config.name,
    createdAt: new Date().toISOString(),
    root,
    configPath,
    notes,
    files: selected.files,
    skipped: selected.skipped,
    commands: receipts,
    totals: {
      fileCount: selected.files.length,
      includedBytes: selected.files.reduce((total, file) => total + file.size, 0),
      skippedCount: selected.skipped.length
    }
  };

  const manifestPath = path.join(outDir, `${config.name}.manifest.json`);
  const archivePath = path.join(outDir, `${config.name}.tar.gz`);
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  await tar.c(
    {
      cwd: root,
      file: archivePath,
      gzip: true,
      portable: true,
      noMtime: true
    },
    [...selected.files.map((file) => file.path), path.relative(root, manifestPath)]
  );

  return { archivePath, manifestPath, manifest };
}

