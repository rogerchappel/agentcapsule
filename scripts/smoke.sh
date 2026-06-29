#!/usr/bin/env bash
set -euo pipefail

npm run build >/dev/null

fixture="tmp/smoke-agentcapsule"
rm -rf "$fixture"
mkdir -p "$fixture"
printf '# Smoke fixture\n' > "$fixture/README.md"
printf 'SECRET=redacted\n' > "$fixture/.env"

node dist/src/bin.js --help > "$fixture/help.txt"
grep -q "agentcapsule plan" "$fixture/help.txt"
node dist/src/bin.js init --root "$fixture"
node dist/src/bin.js plan --root "$fixture" > "$fixture/plan.json"
grep -q '"warnings"' "$fixture/plan.json"
grep -q 'secret-like files' "$fixture/plan.json"
node dist/src/bin.js pack --root "$fixture" --note "smoke run" > "$fixture/pack.txt"
grep -q "Packed" "$fixture/pack.txt"
node dist/src/bin.js check "$fixture/.agentcapsule/handoff.tar.gz" > "$fixture/check.json"
grep -q '"ok": true' "$fixture/check.json"
node dist/src/bin.js inspect "$fixture/.agentcapsule/handoff.tar.gz" > "$fixture/inspect.json"
grep -q '"capsuleName": "handoff"' "$fixture/inspect.json"
node dist/src/bin.js unpack "$fixture/.agentcapsule/handoff.tar.gz" --out "$fixture/unpacked"
test -f "$fixture/unpacked/README.md"
test -f dist/src/index.js
test -f dist/src/bin.js
