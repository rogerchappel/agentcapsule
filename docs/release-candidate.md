# Release Candidate Checklist

Use this checklist before publishing an AgentCapsule package or tagging a release.

## Verification

- Run `npm run release:check`.
- Confirm `npm run smoke` still builds the package and exercises the packaged CLI entrypoint.
- Inspect `npm pack --dry-run` output and confirm it includes `dist`, `docs`, `README.md`, `LICENSE`, and `SECURITY.md`.

## Evidence

- Record CLI entrypoint changes when command behavior changes.
- Include pack, unpack, or inspect manifest changes in release notes.
- Note any config defaults or exclusion changes.

## Support Notes

- Keep capsule fixtures local and synthetic.
- Do not publish capsules containing private repository data or secrets.
