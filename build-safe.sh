#!/usr/bin/env bash
set -euo pipefail

# =========================
# build-safe.sh
# Safe npm install + next build under cgroup v2 (CPU/mem limited)
# Target: small instance (2U2G), with swap enabled.
# =========================

# ---- Config (adjust if you want) ----
CG_NAME="npm-build"
CG_ROOT="/sys/fs/cgroup"
CG_PATH="${CG_ROOT}/${CG_NAME}"

# CPU: limit to ~1 core
# format: "<quota> <period>" in microseconds
CPU_QUOTA_US=100000
CPU_PERIOD_US=100000

# Memory limit for build processes (bytes)
# Recommend 1200~1500MB on 2U2G; leave memory for system/ssh
MEM_LIMIT_MB=1400

# Node heap limit (MB). 1024 is a safe default for 2U2G + swap.
NODE_HEAP_MB=1024

# Use npm ci if lockfile exists, else npm install
USE_NPM_CI=true

# ------------------------------------

need_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    echo "[ERR] Please run as root (sudo)."
    exit 1
  fi
}

check_cgroup_v2() {
  if [[ ! -f "${CG_ROOT}/cgroup.controllers" ]]; then
    echo "[ERR] cgroup v2 not detected at ${CG_ROOT}."
    echo "      Run: mount | grep cgroup"
    exit 1
  fi
}

ensure_swap() {
  if ! swapon --show | tail -n +2 | grep -q .; then
    echo "[WARN] No swap detected. Build may still OOM on small instances."
    echo "       Consider enabling swap (you already did earlier)."
  fi
}

create_cgroup() {
  mkdir -p "${CG_PATH}"

  # CPU limit
  echo "${CPU_QUOTA_US} ${CPU_PERIOD_US}" > "${CG_PATH}/cpu.max"

  # Memory limit
  echo $((MEM_LIMIT_MB * 1024 * 1024)) > "${CG_PATH}/memory.max"

  # OOM group: if OOM happens, kill this cgroup's processes as a group
  if [[ -f "${CG_PATH}/memory.oom.group" ]]; then
    echo 1 > "${CG_PATH}/memory.oom.group"
  fi

  echo "[OK] cgroup created: ${CG_PATH}"
  echo "     cpu.max = $(cat "${CG_PATH}/cpu.max")"
  echo "     memory.max = $(cat "${CG_PATH}/memory.max")"
}

run_in_cgroup() {
  # Run a command in a fresh subshell that is moved into the cgroup
  # so only build processes are limited, not your interactive shell.
  local cmd="$*"

  bash -lc "
    set -euo pipefail
    echo \$\$ > '${CG_PATH}/cgroup.procs'

    export NODE_OPTIONS='--max-old-space-size=${NODE_HEAP_MB}'
    echo '[INFO] NODE_OPTIONS='\"\$NODE_OPTIONS\"

    ${cmd}
  "
}

main() {
  need_root
  check_cgroup_v2
  ensure_swap

  # Move into project dir (script location)
  cd "$(dirname "$0")"

  if [[ ! -f package.json ]]; then
    echo "[ERR] package.json not found in $(pwd)."
    echo "      Put this script inside your project directory."
    exit 1
  fi

  create_cgroup

  # Install deps
  if [[ "${USE_NPM_CI}" == "true" && -f package-lock.json ]]; then
    echo "[STEP] npm ci (locked install)"
    run_in_cgroup "npm ci"
  else
    echo "[STEP] npm install"
    run_in_cgroup "npm install"
  fi

  # Build
  echo "[STEP] npm run build"
  run_in_cgroup "npm run build"

  echo "[DONE] Build finished under cgroup limits."
  echo "       You can start with: npm run start"
}

main "$@"
