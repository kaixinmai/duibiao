#!/usr/bin/env bash
# 数据对标智能体 — 部署到 Netlify 生产环境
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "${NETLIFY_AUTH_TOKEN:-}" ]; then
  if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
  fi
fi

if [ -z "${NETLIFY_AUTH_TOKEN:-}" ]; then
  echo "错误: 请设置 NETLIFY_AUTH_TOKEN（可在 .env 中配置）"
  exit 1
fi

export NETLIFY_AUTH_TOKEN
npx netlify deploy --prod --dir . --message "deploy: $(date '+%Y-%m-%d %H:%M:%S')"
