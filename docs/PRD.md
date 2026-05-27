# agentcapsule PRD

Status: in-progress

## Summary

agentcapsule creates portable, reviewable context bundles for handoffs between coding agents. It packs selected files, command outputs, notes, and a manifest into a local archive without hidden telemetry or cloud upload.

## Problem

Agent handoffs are usually a pasted summary plus "go look around." That loses evidence, misses files, and makes later review awkward. Developers need a small local artifact that shows exactly what was included, why, and how to unpack it.

## Users

- Developers delegating bounded work to agents.
- Maintainers collecting repro context for contributors.
- Agents preparing an auditable handoff bundle.

## V1 Scope

- `init` a capsule config with include/exclude globs.
- `pack` a directory into `.agentcapsule/<name>.tar.gz` plus manifest JSON.
- `inspect` an existing capsule without unpacking.
- `unpack` into a chosen directory with overwrite protection.
- Support notes, command receipts, checksums, and size limits.
- Add tests with fixtures for includes, excludes, manifests, and unpack safety.

## Non-Goals

- Cloud sync.
- Encryption in V1.
- Agent protocol standardization.

## Safety

- Deny common secret files by default (`.env`, private keys, token stores).
- Show skipped files in the manifest.
- Refuse path traversal entries while unpacking.

## Inspiration

Inspired by reproducible bug bundles and support archives, reframed for agentic coding handoffs with a small local-first surface.
