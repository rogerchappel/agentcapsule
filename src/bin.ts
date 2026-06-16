#!/usr/bin/env node
import { initConfig } from "./config.js";
import { inspectCapsule } from "./inspect.js";
import { packCapsule } from "./pack.js";
import { unpackCapsule } from "./unpack.js";

function help(): string {
  return `agentcapsule

Usage:
  agentcapsule init [--root <dir>] [--force]
  agentcapsule pack [--root <dir>] [--note <text>]
  agentcapsule inspect <archive>
  agentcapsule unpack <archive> --out <dir> [--force]
  agentcapsule --help

Commands:
  init     Write agentcapsule.config.json for a project.
  pack     Create .agentcapsule/<name>.tar.gz and a manifest.
  inspect  Print a capsule manifest as JSON.
  unpack   Extract a capsule with path traversal and overwrite guards.
`;
}

function readOption(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
}

function readRepeatedOption(argv: string[], name: string): string[] {
  const values: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === name && argv[index + 1]) {
      values.push(argv[index + 1]);
      index += 1;
    }
  }
  return values;
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  try {
    if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
      process.stdout.write(help());
      return 0;
    }

    const [command, firstArg] = argv;
    const root = readOption(argv, "--root") ?? process.cwd();

    if (command === "init") {
      const configPath = await initConfig(root, argv.includes("--force"));
      process.stdout.write(`Wrote ${configPath}\n`);
      return 0;
    }

    if (command === "pack") {
      const result = await packCapsule({ root, note: readRepeatedOption(argv, "--note") });
      process.stdout.write(`Packed ${result.manifest.totals.fileCount} file(s) to ${result.archivePath}\n`);
      process.stdout.write(`Manifest: ${result.manifestPath}\n`);
      return 0;
    }

    if (command === "inspect" && firstArg) {
      const manifest = await inspectCapsule(firstArg);
      process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
      return 0;
    }

    if (command === "unpack" && firstArg) {
      const destination = readOption(argv, "--out");
      if (!destination) {
        throw new Error("unpack requires --out <dir>");
      }
      const result = await unpackCapsule({ archivePath: firstArg, destination, force: argv.includes("--force") });
      process.stdout.write(`Unpacked ${result.entries.length} file(s) to ${result.destination}\n`);
      if (result.skipped.length > 0) {
        process.stdout.write(`Skipped ${result.skipped.length} existing or unsafe entry/entries\n`);
      }
      return 0;
    }

    process.stderr.write(help());
    return 2;
  } catch (error) {
    process.stderr.write(`agentcapsule: ${(error as Error).message}\n`);
    return 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await main();
}
