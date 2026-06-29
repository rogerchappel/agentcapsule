# AgentCapsule Orchestration Plan

AgentCapsule is intended for local context capsule preparation and inspection.

## Safe Automation Boundary

- Keep capsule operations local unless a human explicitly publishes an artifact.
- Avoid adding secrets, private repository data, or unreviewed command output to capsule fixtures.
- Treat archive extraction paths as untrusted input and keep safe path checks in place.

## Suggested Flow

1. Build the package with `npm run build`.
2. Run `agentcapsule init --root <repo>` when the target has no config.
3. Run `agentcapsule plan --root <repo>` and review included files, skipped files, and warnings before packing.
4. Run `agentcapsule pack --root <repo> --note "<handoff purpose>"`.
5. Run `agentcapsule check <archive>` before sharing the capsule with another human or agent.
6. Use `agentcapsule inspect <archive>` for review and `agentcapsule unpack <archive> --out <dir>` only into a controlled directory.
7. Run release checks before opening release PRs.

## Release Flow

- Run `npm run release:check`.
- Review `docs/release-candidate.md`.
- Include CLI entrypoint, manifest, pack, unpack, or inspect changes in release notes.
