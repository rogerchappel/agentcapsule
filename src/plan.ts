import path from "node:path";
import { loadConfig } from "./config.js";
import { selectFiles } from "./files.js";
import type { CapsulePlan } from "./types.js";

export async function planCapsule(rootInput: string): Promise<CapsulePlan> {
  const root = path.resolve(rootInput);
  const { config, path: configPath } = await loadConfig(root);
  const selected = await selectFiles(root, config);
  const includedBytes = selected.files.reduce((total, file) => total + file.size, 0);

  return {
    capsuleName: config.name,
    root,
    configPath,
    include: config.include,
    exclude: config.exclude,
    commands: config.commands,
    files: selected.files,
    skipped: selected.skipped,
    totals: {
      fileCount: selected.files.length,
      includedBytes,
      skippedCount: selected.skipped.length
    },
    warnings: buildPlanWarnings(selected.skipped.map((file) => file.reason), includedBytes, config.maxTotalBytes)
  };
}

function buildPlanWarnings(skipReasons: string[], includedBytes: number, maxTotalBytes: number): string[] {
  const warnings = new Set<string>();
  if (includedBytes > maxTotalBytes * 0.9) {
    warnings.add("included bytes are within 10% of maxTotalBytes");
  }

  for (const reason of skipReasons) {
    if (reason.includes("secret denylist")) {
      warnings.add("secret-like files were skipped by the default denylist");
    }
    if (reason.includes("exceeds max")) {
      warnings.add("one or more files were skipped by size limits");
    }
  }

  return [...warnings].sort();
}
