#!/usr/bin/env bash
# End-to-end: build the web app, serve it, and play the vertical slice with Playwright.
#
#   npm run e2e        # play it, fail on any problem
#   npm run screens    # the same, saving phone-size screenshots to ./screens
#
# Needs Chromium for Playwright: `npx playwright install chromium`, or set
# PW_CHROMIUM to an existing build (the cloud dev container has /opt/pw-browsers/chromium).
set -euo pipefail
mode="${1:-test}"
root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d)"
port="${E2E_WEB_PORT:-8792}"
pids=()
cleanup() {
  for p in "${pids[@]}"; do kill "$p" 2>/dev/null || true; done
  rm -rf "$work"
}
trap cleanup EXIT

if [[ -z "${PW_CHROMIUM:-}" && -x /opt/pw-browsers/chromium ]]; then export PW_CHROMIUM=/opt/pw-browsers/chromium; fi
if [[ "$mode" == screens ]]; then export SHOTS="${SHOTS:-$root/screens}"; mkdir -p "$SHOTS"; fi

echo "build    web"
(cd "$root/app" && CI=1 npx expo export --platform web --clear --output-dir "$work/web" >"$work/build.log" 2>&1) \
  || { grep -v '^\s*at ' "$work/build.log" | tail -30; exit 1; }
node "$root/e2e/serve.mjs" "$work/web" "$port" >/dev/null 2>&1 &
pids+=($!)
sleep 1

echo "e2e      vertical slice"
E2E_URL="http://localhost:$port/" node "$root/e2e/slice.mjs"
