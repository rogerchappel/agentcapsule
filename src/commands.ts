import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { CapsuleCommand, CommandReceipt } from "./types.js";

const execAsync = promisify(exec);

export async function runCommandReceipts(commands: CapsuleCommand[], cwd: string): Promise<CommandReceipt[]> {
  const receipts: CommandReceipt[] = [];

  for (const command of commands) {
    const started = Date.now();
    try {
      const result = await execAsync(command.command, {
        cwd,
        timeout: 30_000,
        maxBuffer: 512_000
      });
      receipts.push({
        ...command,
        exitCode: 0,
        stdout: result.stdout,
        stderr: result.stderr,
        durationMs: Date.now() - started
      });
    } catch (error) {
      const err = error as Error & { code?: number | null; stdout?: string; stderr?: string };
      receipts.push({
        ...command,
        exitCode: typeof err.code === "number" ? err.code : null,
        stdout: err.stdout ?? "",
        stderr: err.stderr ?? err.message,
        durationMs: Date.now() - started
      });
    }
  }

  return receipts;
}

