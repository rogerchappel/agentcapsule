export { CONFIG_FILE, DEFAULT_CONFIG, DEFAULT_EXCLUDES, DEFAULT_SECRET_DENY, initConfig, loadConfig } from "./config.js";
export { checkCapsule, validateManifest } from "./check.js";
export { inspectCapsule } from "./inspect.js";
export { packCapsule } from "./pack.js";
export { planCapsule } from "./plan.js";
export { unpackCapsule } from "./unpack.js";
export { isUnsafeEntryPath, safeJoin, selectFiles } from "./files.js";
export type {
  CapsuleCheck,
  CapsuleCommand,
  CapsuleConfig,
  CapsuleManifest,
  CapsulePlan,
  CommandReceipt,
  ManifestFile,
  PackResult,
  SkippedFile,
  UnpackResult
} from "./types.js";

export const version = "0.1.0";
