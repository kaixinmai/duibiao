#!/usr/bin/env bash
# 数据对标智能体 — 监听本地文件变化，自动部署到 Netlify 生产环境
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

SITE_URL="https://data-benchmark-agent.netlify.app"

echo "▶ 数据对标智能体 — Netlify 自动同步已启动"
echo "  生产地址: ${SITE_URL}"
echo "  保存任意项目文件后，约 3 秒自动部署（已做防抖）"
echo "  按 Ctrl+C 停止"
echo ""

npx chokidar \
  "index.html" \
  "*.css" \
  "*.js" \
  "js/**/*.js" \
  "assets/**/*" \
  "vendor/**/*" \
  "netlify.toml" \
  "scripts/**/*.sh" \
  --ignore "node_modules/**" \
  --ignore "_design-ref/**" \
  --ignore "数据对标智能体dist/**" \
  --ignore ".netlify/**" \
  --debounce 3000 \
  --initial false \
  -c "bash scripts/netlify-deploy.sh"
