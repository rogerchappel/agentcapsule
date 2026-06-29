# agentcapsule

Local-first context capsules for coding-agent handoffs.

## Status

This repository is early-stage. Use it for local developer automation and review workflows, and verify results before relying on them in production.

## Install

Install the published CLI:

```sh
npm install -g agentcapsule
```

For local development:

```sh
npm ci
npm run build
```

## Use

Inspect the CLI surface first:

```sh
npx agentcapsule --help
```

Create a local config, preview what would be included, then pack and validate a
capsule:

```sh
agentcapsule init --root .
agentcapsule plan --root . > capsule-plan.json
agentcapsule pack --root . --note "handoff for issue 42"
agentcapsule check .agentcapsule/handoff.tar.gz
```

`plan` is the safest first command for agents because it shows included files,
skipped files, command receipts configured for capture, and warnings before an
archive is written. `check` validates a manifest or archive for unsafe paths,
duplicate entries, failed command receipts, checksum shape, and manifest total
mismatches.

Run the project verification command before making changes:

```sh
npm test
```

## Verify

```sh
npm test
npm run check
npm run smoke
npm run package:smoke
npm run release:check
```

`npm run release:check` is the release-readiness gate used before publishing or
promotion. It covers the build, type check, tests, CLI smoke path, and dry-run
package contents.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Keep changes small, reviewable, and backed by the verification commands above.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance. Do not include secrets, private logs, or customer data in issues or fixtures.

## License

MIT
