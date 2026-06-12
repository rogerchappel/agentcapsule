# Release Checklist

Use this checklist before publishing or announcing AgentCapsule.

1. Install dependencies with `npm ci`.
2. Run `npm run release:check`.
3. Run `bash scripts/validate.sh`.
4. Confirm `npm run package:smoke` lists `dist/src/index.js` and `dist/src/bin.js`.
5. Review generated capsule examples for accidental secrets before sharing release notes.
