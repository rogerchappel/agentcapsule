# AgentCapsule Orchestration Plan

AgentCapsule is intended for local context capsule preparation and inspection.

## Safe Automation Boundary

- Keep capsule operations local unless a human explicitly publishes an artifact.
- Avoid adding secrets, private repository data, or unreviewed command output to capsule fixtures.
- Treat archive extraction paths as untrusted input and keep safe path checks in place.

## Suggested Flow

1. Build the package with `npm run build`.
2. Run `agentcapsule` or future pack/inspect commands against synthetic fixtures first.
3. Review capsule contents before sharing them with another human or agent.
4. Run release checks before opening release PRs.

## Release Flow

- Run `npm run release:check`.
- Review `docs/release-candidate.md`.
- Include CLI entrypoint, manifest, pack, unpack, or inspect changes in release notes.
