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

Git installs run `npm run build` through the package `prepare` hook so the
published `agentcapsule` bin points at a generated `dist/src/bin.js` file.

## Usage

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


## Verification

Run the local quality gates before opening a pull request:

```sh
npm run lint
npm test
npm run smoke
```

`npm run lint` is an alias for the repository static check so contributors can use the common npm workflow without guessing the project-specific command.

## Limitations

`agentcapsule` is designed for local handoff archives and manifest checks. It
does not encrypt capsule contents, upload archives, or decide which private
files are safe to share outside your environment. Review the generated plan and
archive before sending a capsule to another person or service.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Keep changes small, reviewable, and backed by the verification commands above.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance. Do not include secrets, private logs, or customer data in issues or fixtures.

## License

MIT
