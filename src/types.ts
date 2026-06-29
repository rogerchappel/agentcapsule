export type CapsuleCommand = {
  name: string;
  command: string;
};

export type CapsuleConfig = {
  name: string;
  include: string[];
  exclude: string[];
  notes: string[];
  commands: CapsuleCommand[];
  maxFileBytes: number;
  maxTotalBytes: number;
};

export type ManifestFile = {
  path: string;
  size: number;
  sha256: string;
};

export type SkippedFile = {
  path: string;
  reason: string;
};

export type CommandReceipt = CapsuleCommand & {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
};

export type CapsuleManifest = {
  schemaVersion: 1;
  capsuleName: string;
  createdAt: string;
  root: string;
  configPath: string;
  notes: string[];
  files: ManifestFile[];
  skipped: SkippedFile[];
  commands: CommandReceipt[];
  totals: {
    fileCount: number;
    includedBytes: number;
    skippedCount: number;
  };
};

export type CapsulePlan = {
  capsuleName: string;
  root: string;
  configPath: string;
  include: string[];
  exclude: string[];
  commands: CapsuleCommand[];
  files: ManifestFile[];
  skipped: SkippedFile[];
  totals: CapsuleManifest["totals"];
  warnings: string[];
};

export type CapsuleCheck = {
  ok: boolean;
  capsuleName: string;
  fileCount: number;
  skippedCount: number;
  commandCount: number;
  findings: string[];
};

export type PackResult = {
  archivePath: string;
  manifestPath: string;
  manifest: CapsuleManifest;
};

export type UnpackResult = {
  destination: string;
  entries: string[];
  skipped: SkippedFile[];
};
