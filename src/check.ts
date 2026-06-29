import { readFile } from "node:fs/promises";
import { isUnsafeEntryPath } from "./files.js";
import { inspectCapsule } from "./inspect.js";
import type { CapsuleCheck, CapsuleManifest } from "./types.js";

export async function checkCapsule(inputPath: string): Promise<CapsuleCheck> {
  const manifest = inputPath.endsWith(".json")
    ? (JSON.parse(await readFile(inputPath, "utf8")) as CapsuleManifest)
    : await inspectCapsule(inputPath);
  const findings = validateManifest(manifest);

  return {
    ok: findings.length === 0,
    capsuleName: manifest.capsuleName,
    fileCount: manifest.files.length,
    skippedCount: manifest.skipped.length,
    commandCount: manifest.commands.length,
    findings
  };
}

export function validateManifest(manifest: CapsuleManifest): string[] {
  const findings: string[] = [];
  const paths = new Set<string>();
  let includedBytes = 0;

  for (const file of manifest.files) {
    if (isUnsafeEntryPath(file.path)) {
      findings.push(`unsafe file path: ${file.path}`);
    }
    if (paths.has(file.path)) {
      findings.push(`duplicate file path: ${file.path}`);
    }
    paths.add(file.path);
    includedBytes += file.size;

    if (!/^[a-f0-9]{64}$/.test(file.sha256)) {
      findings.push(`invalid sha256 for ${file.path}`);
    }
  }

  if (manifest.totals.fileCount !== manifest.files.length) {
    findings.push(`file count mismatch: totals=${manifest.totals.fileCount} files=${manifest.files.length}`);
  }
  if (manifest.totals.includedBytes !== includedBytes) {
    findings.push(`included byte mismatch: totals=${manifest.totals.includedBytes} files=${includedBytes}`);
  }
  if (manifest.totals.skippedCount !== manifest.skipped.length) {
    findings.push(`skipped count mismatch: totals=${manifest.totals.skippedCount} skipped=${manifest.skipped.length}`);
  }

  for (const command of manifest.commands) {
    if (command.exitCode !== 0) {
      findings.push(`command receipt failed: ${command.name} exitCode=${command.exitCode}`);
    }
  }

  return findings.sort();
}
