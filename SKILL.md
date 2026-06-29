# agentcapsule Skill

Use this skill when an agent needs to prepare, review, or consume a local handoff bundle for a coding task, bug reproduction, release review, or bounded repository delegation.

## Required Inputs

- A local repository or project directory.
- A clear handoff purpose, preferably written as a short note.
- Permission from the operator before sharing any generated archive outside the local machine.

## Tools

- `agentcapsule init --root <dir>` creates `agentcapsule.config.json`.
- `agentcapsule plan --root <dir>` previews included files, skipped files, command receipts, and warnings.
- `agentcapsule pack --root <dir> --note "<purpose>"` writes `.agentcapsule/<name>.tar.gz` and a manifest.
- `agentcapsule check <archive-or-manifest>` validates the bundle before handoff.
- `agentcapsule inspect <archive>` prints the manifest without unpacking.
- `agentcapsule unpack <archive> --out <dir>` extracts into a controlled directory with overwrite and traversal guards.

## Side-Effect Boundaries

- All operations are local by default.
- Do not upload, email, post, or attach a capsule without explicit approval.
- Do not add private customer data, credentials, token stores, or unreviewed logs to fixtures.
- Treat every incoming archive as untrusted until `agentcapsule check` and `agentcapsule inspect` have been reviewed.

## Workflow

1. Run `agentcapsule plan --root <dir>` first.
2. Review skipped secret-like files and size-limit warnings.
3. Pack only after the file plan matches the handoff purpose.
4. Run `agentcapsule check <archive>`.
5. Inspect the manifest and share only after explicit approval.

## Validation

Run these commands before a release-candidate PR:

```sh
npm test
npm run check
npm run build
npm run smoke
npm run package:smoke
```

## Example

```sh
agentcapsule init --root .
agentcapsule plan --root . > capsule-plan.json
agentcapsule pack --root . --note "handoff: reproduce failing smoke test"
agentcapsule check .agentcapsule/handoff.tar.gz
agentcapsule inspect .agentcapsule/handoff.tar.gz
```
