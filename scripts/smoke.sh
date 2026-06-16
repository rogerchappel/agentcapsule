#!/usr/bin/env bash
set -euo pipefail

npm run build >/dev/null

fixture="tmp/smoke-agentcapsule"
rm -rf "$fixture"
mkdir -p "$fixture"
printf '# Smoke fixture\n' > "$fixture/README.md"

node dist/src/bin.js --help | grep -q "agentcapsule pack"
node dist/src/bin.js init --root "$fixture"
node dist/src/bin.js pack --root "$fixture" --note "smoke run" | grep -q "Packed"
node dist/src/bin.js inspect "$fixture/.agentcapsule/handoff.tar.gz" | grep -q '"capsuleName": "handoff"'
node dist/src/bin.js unpack "$fixture/.agentcapsule/handoff.tar.gz" --out "$fixture/unpacked"
test -f "$fixture/unpacked/README.md"
test -f dist/src/index.js
test -f dist/src/bin.js
