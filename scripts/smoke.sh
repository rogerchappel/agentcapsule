#!/usr/bin/env bash
set -euo pipefail

npm run build >/dev/null

output="$(node dist/src/bin.js)"
test "$output" = "agentcapsule"
test -f dist/src/index.js
test -f dist/src/bin.js
