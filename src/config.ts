import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CapsuleConfig } from "./types.js";

export const CONFIG_FILE = "agentcapsule.config.json";

export const DEFAULT_EXCLUDES = [
  ".git/**",
  ".agentcapsule/**",
  "node_modules/**",
  "dist/**",
  "coverage/**",
  ".DS_Store"
];

export const DEFAULT_SECRET_DENY = [
  ".env",
  ".env.*",
  "**/.env",
  "**/.env.*",
  "*.pem",
  "**/*.pem",
  "*.key",
  "**/*.key",
  "id_rsa",
  "id_ed25519",
  "**/id_rsa",
  "**/id_ed25519",
  ".npmrc",
  "**/.npmrc",
  ".netrc",
  "**/.netrc",
  ".aws/credentials",
  "**/.aws/credentials"
];

export const DEFAULT_CONFIG: CapsuleConfig = {
  name: "handoff",
  include: ["**/*"],
  exclude: DEFAULT_EXCLUDES,
  notes: [],
  commands: [],
  maxFileBytes: 2_000_000,
  maxTotalBytes: 25_000_000
};

export function configPathFor(root: string): string {
  return path.join(root, CONFIG_FILE);
}

export async function initConfig(root: string, force = false): Promise<string> {
  const configPath = configPathFor(root);
  if (existsSync(configPath) && !force) {
    throw new Error(`${CONFIG_FILE} already exists; pass --force to overwrite it`);
  }

  await writeFile(configPath, `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`, "utf8");
  return configPath;
}

export async function loadConfig(root: string): Promise<{ config: CapsuleConfig; path: string }> {
  const configPath = configPathFor(root);
  if (!existsSync(configPath)) {
    throw new Error(`missing ${CONFIG_FILE}; run agentcapsule init first`);
  }

  const parsed = JSON.parse(await readFile(configPath, "utf8")) as Partial<CapsuleConfig>;
  return { config: normalizeConfig(parsed), path: configPath };
}

export function normalizeConfig(input: Partial<CapsuleConfig>): CapsuleConfig {
  return {
    name: sanitizeName(input.name ?? DEFAULT_CONFIG.name),
    include: normalizeStringArray(input.include, DEFAULT_CONFIG.include),
    exclude: normalizeStringArray(input.exclude, DEFAULT_CONFIG.exclude),
    notes: normalizeStringArray(input.notes, DEFAULT_CONFIG.notes),
    commands: Array.isArray(input.commands)
      ? input.commands
          .filter((command) => command && typeof command.name === "string" && typeof command.command === "string")
          .map((command) => ({ name: command.name, command: command.command }))
      : DEFAULT_CONFIG.commands,
    maxFileBytes: normalizePositiveInteger(input.maxFileBytes, DEFAULT_CONFIG.maxFileBytes),
    maxTotalBytes: normalizePositiveInteger(input.maxTotalBytes, DEFAULT_CONFIG.maxTotalBytes)
  };
}

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const strings = value.filter((item): item is string => typeof item === "string" && item.length > 0);
  return strings.length > 0 ? strings : fallback;
}

function normalizePositiveInteger(value: unknown, fallback: number): number {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : fallback;
}

function sanitizeName(value: string): string {
  const name = value.trim().replace(/[^a-zA-Z0-9._-]/g, "-");
  return name.length > 0 ? name : DEFAULT_CONFIG.name;
}

