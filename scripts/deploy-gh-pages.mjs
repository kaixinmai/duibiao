/**
 * 手动部署静态页到 GitHub Pages（一般不必用：推 main 会由 Actions 自动部署）
 * 用法：node scripts/deploy-gh-pages.mjs
 */
import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, cpSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const remote =
  process.env.PAGES_REMOTE || "https://github.com/kaixinmai/duibiao.git";
const branch = "gh-pages";
const siteUrl = "https://kaixinmai.github.io/duibiao/";
const work = mkdtempSync(join(tmpdir(), "gh-pages-duibiao-"));

const skip = new Set([
  ".git",
  ".github",
  "node_modules",
  "_site",
  "package-lock.json",
]);

function git(args) {
  execSync(`git ${args}`, { cwd: work, stdio: "inherit" });
}

try {
  for (const name of [
    "index.html",
    "package.json",
    "vite.config.js",
    "config.js",
    "agent-icon.js",
    "auth-modal.css",
    "benchmark-agent.css",
    "carbon-target-agent.css",
    "carbon-target-agent.js",
    "carbon-target-report.js",
    "data-benchmark-agent.js",
    "netlify.toml",
    "README.md",
    "使用说明.txt",
    ".netlifyignore",
    "assets",
    "js",
    "scripts",
    "vendor",
    "white-green-ui-kit",
  ]) {
    const src = join(root, name);
    if (!existsSync(src) || skip.has(name)) continue;
    cpSync(src, join(work, name), { recursive: true });
  }
  writeFileSync(join(work, ".nojekyll"), "");
  git("init");
  git(`checkout -b ${branch}`);
  git("add -A");
  git('commit -m "Deploy GitHub Pages"');
  git(`remote add origin ${remote}`);
  git(`push -f origin ${branch}`);
  console.log(`\nPushed to ${remote} (${branch})`);
  console.log(`Site: ${siteUrl}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
