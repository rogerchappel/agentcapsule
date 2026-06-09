# AgentCapsule Task Breakdown

## Completed MVP Scope

- Provide package metadata, build, test, smoke, package dry-run, and release check scripts.
- Expose a packaged CLI entrypoint through `agentcapsule`.
- Include public support files and release-candidate guidance in package contents.
- Cover package metadata with a fixture-backed Node test.

## Release Readiness

- Keep the `bin` entry aligned with the TypeScript build output.
- Run `npm run release:check` before release PRs.
- Confirm package contents include `README.md`, `LICENSE`, `SECURITY.md`, and docs.

## Next Candidates

- Expand CLI commands for pack, unpack, and inspect flows.
- Add smoke fixtures for capsule manifests and safe archive extraction.
- Document limits for capsule size, excluded paths, and command receipts.
