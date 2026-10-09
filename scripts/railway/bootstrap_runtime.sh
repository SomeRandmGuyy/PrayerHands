#!/bin/bash
# Bootstraps the OpenHands action execution server inside a Railway-hosted webtop VM.
#
# The Railway service start command downloads and runs this script in the background
# alongside /init. It is idempotent: the Python virtualenv lives on the persistent
# /config volume, so the (slow) package install only happens on first boot or when
# OPENHANDS_GIT_REF changes.
#
# Required service environment variables:
#   SESSION_API_KEY  - auth token enforced by the action execution server
#   PIXELFLUX_CU     - port of the pixelflux Computer Use API (e.g. 5901)
#
# Optional environment variables:
#   OPENHANDS_GIT_REPO  - git repo of this fork (default: somerandmguyy/prayerhands)
#   OPENHANDS_GIT_REF   - branch/tag/commit to install (default: main)
#   OPENHANDS_SERVER_PORT - port for the action server (default: 30001)

set -euo pipefail

VENV_DIR="${OPENHANDS_VENV_DIR:-/config/.venv-openhands}"
WORKSPACE_DIR="${OPENHANDS_WORKSPACE_DIR:-/workspace}"
PORT="${OPENHANDS_SERVER_PORT:-30001}"
GIT_REPO="${OPENHANDS_GIT_REPO:-https://github.com/somerandmguyy/prayerhands}"
GIT_REF="${OPENHANDS_GIT_REF:-main}"
REF_FILE="$VENV_DIR/.openhands-ref"
PUID="${PUID:-1000}"
RUN_USER="${CUSTOM_USER:-abc}"

echo "[openhands-bootstrap] starting: repo=$GIT_REPO ref=$GIT_REF port=$PORT"

mkdir -p "$WORKSPACE_DIR" "$VENV_DIR"

if ! command -v python3 >/dev/null 2>&1; then
  echo "[openhands-bootstrap] installing python3"
  apt-get update -qq && apt-get install -y -qq python3 python3-venv
fi
if ! python3 -m venv --help >/dev/null 2>&1; then
  echo "[openhands-bootstrap] installing python3-venv"
  apt-get update -qq && apt-get install -y -qq python3-venv
fi

# Decide whether the venv needs (re)installation
NEEDS_INSTALL=0
if [ ! -x "$VENV_DIR/bin/python" ]; then
  echo "[openhands-bootstrap] creating venv at $VENV_DIR"
  python3 -m venv "$VENV_DIR"
  NEEDS_INSTALL=1
elif [ ! -f "$REF_FILE" ] || [ "$(cat "$REF_FILE" 2>/dev/null || true)" != "$GIT_REF" ]; then
  echo "[openhands-bootstrap] git ref changed, reinstalling"
  NEEDS_INSTALL=1
fi

if [ "$NEEDS_INSTALL" = "1" ]; then
  export SKIP_VSCODE_BUILD=1
  "$VENV_DIR/bin/pip" install --upgrade pip
  "$VENV_DIR/bin/pip" install --no-cache-dir "openhands-ai @ git+$GIT_REPO@$GIT_REF"
  echo "$GIT_REF" > "$REF_FILE"
fi

# Self-heal: if the venv exists but the package is broken, force a reinstall once
if ! "$VENV_DIR/bin/python" -c 'import openhands.runtime.action_execution_server' >/dev/null 2>&1; then
  echo "[openhands-bootstrap] openhands import failed, forcing reinstall"
  export SKIP_VSCODE_BUILD=1
  "$VENV_DIR/bin/pip" install --no-cache-dir --force-reinstall "openhands-ai @ git+$GIT_REPO@$GIT_REF"
  echo "$GIT_REF" > "$REF_FILE"
fi

chown -R "$PUID" "$WORKSPACE_DIR" "$VENV_DIR" 2>/dev/null || true

echo "[openhands-bootstrap] launching action execution server on port $PORT"

if [ "$(id -u)" = "0" ]; then
  exec setpriv --reuid "$PUID" --regid "$PUID" --init-groups \
    env SESSION_API_KEY="$SESSION_API_KEY" PIXELFLUX_CU="$PIXELFLUX_CU" \
    "$VENV_DIR/bin/python" -u -m openhands.runtime.action_execution_server "$PORT" \
    --working-dir "$WORKSPACE_DIR" \
    --username "$RUN_USER" \
    --user-id "$PUID" \
    --no-enable-browser
else
  exec "$VENV_DIR/bin/python" -u -m openhands.runtime.action_execution_server "$PORT" \
    --working-dir "$WORKSPACE_DIR" \
    --username "$RUN_USER" \
    --user-id "$PUID" \
    --no-enable-browser
fi