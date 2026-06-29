# AgentCapsule Task Breakdown

## Completed MVP Scope

- Provide package metadata, build, test, smoke, package dry-run, and release check scripts.
- Expose a packaged CLI entrypoint through `agentcapsule`.
- Include public support files and release-candidate guidance in package contents.
- Cover package metadata with a fixture-backed Node test.
- Add `plan` for pre-pack file selection review and warning capture.
- Add `check` for archive or manifest validation before handoff.
- Add CLI smoke coverage for plan, pack, check, inspect, and unpack.

## Release Readiness

- Keep the `bin` entry aligned with the TypeScript build output.
- Run `npm run release:check` before release PRs.
- Confirm package contents include `README.md`, `LICENSE`, `SECURITY.md`, and docs.

## Next Candidates

- Add richer command receipt redaction and truncation policies.
- Add smoke fixtures for custom include/exclude templates.
- Document limits for capsule size, excluded paths, and command receipts.
