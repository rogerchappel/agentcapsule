# Release Readiness

Use this checklist before publishing, tagging, or asking reviewers to trust the package surface.

## Package Surface

- Package: `agentcapsule`
- Repository: `https://github.com/rogerchappel/agentcapsule`
- Pack contents are constrained by the `files` allowlist in `package.json`.

## CLI Surface

- `agentcapsule` -> `./dist/src/bin.js`
- Supported commands for v0.1.0: `init`, `pack`, `inspect`, and `unpack`.

## Verification Commands

- `npm run check`: `tsc -p tsconfig.json --noEmit`
- `npm run test`: `npm run build && node --test "dist/test/**/*.test.js"`
- `npm run build`: `tsc -p tsconfig.json`
- `npm run smoke`: `bash scripts/smoke.sh`
- `npm run package:smoke`: `npm run build && npm pack --dry-run`
- `npm run release:check`: `npm test && npm run check && npm run build && npm run smoke && npm run package:smoke`

Run `npm run release:check` before opening a release PR. Record any skipped command and the reason in the PR body.

## Reviewer Notes

- Compare README examples with the current CLI bins or module exports.
- Confirm `npm run smoke` creates `tmp/smoke-agentcapsule/.agentcapsule/handoff.tar.gz`, inspects it, and unpacks it.
- Inspect `npm pack --dry-run` output for generated logs, caches, or private fixtures.
- Confirm CI exercises the same release check path used locally.
