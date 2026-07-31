#!/usr/bin/env node
/**
 * 白绿 UI Kit · 一键挂载
 * 用法（在智能体 dist 根目录或任意上级目录）：
 *   node white-green-ui-kit/tools/apply.mjs
 *   node white-green-ui-kit/tools/apply.mjs --root .
 *
 * 行为：
 * - 自动定位 kit 目录
 * - 扫描问答详情 HTML（index.html / *agent*.html 等）
 * - 跳过 dashboard / business / 报告系统等外跳页
 * - 在 </head> 前写入三行 CSS link（已挂载则跳过）
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(__dirname, "..");
const cssRelFromKit = "css";

const OUTBOUND =
  /(\/|^)(business|dashboard|benchmark|cockpit|esg-system|report-view|monthly-|login)(\/|$)/i;

const DETAIL_HTML =
  /(^|\/)(index|carbon-target-agent|esg-report-agent|supply-chain-agent|.*-agent)\.html$/i;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "vendor") continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

function norm(p) {
  return p.split(path.sep).join("/");
}

function isOutbound(rel) {
  return OUTBOUND.test(rel);
}

function isDetailCandidate(rel, base) {
  const n = norm(rel);
  if (isOutbound(n)) return false;
  if (DETAIL_HTML.test(n)) return true;
  // 与 kit 同级的任意 index.html（企业智能体常见）
  if (/\/index\.html$/i.test(n) && !n.includes("/white-green-ui-kit/")) return true;
  return false;
}

function relPosix(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).split(path.sep).join("/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

function buildLinks(htmlFile) {
  const theme = relPosix(htmlFile, path.join(kitRoot, cssRelFromKit, "theme-green.css"));
  const overrides = relPosix(
    htmlFile,
    path.join(kitRoot, cssRelFromKit, "theme-green-overrides.css"),
  );
  const shell = relPosix(htmlFile, path.join(kitRoot, cssRelFromKit, "cta-shell-green.css"));
  return [
    `  <link rel="stylesheet" href="${theme}" id="gc-theme-green" />`,
    `  <link rel="stylesheet" href="${overrides}" />`,
    `  <link rel="stylesheet" href="${shell}" />`,
  ].join("\n");
}

function patchHtml(file) {
  let html = fs.readFileSync(file, "utf8");
  if (/gc-theme-green|cta-shell-green\.css|theme-green-overrides\.css/i.test(html)) {
    return "skip-already";
  }
  if (!/<\/head>/i.test(html)) return "skip-no-head";

  const block =
    "\n  <!-- white-green-ui-kit: auto-applied -->\n" +
    buildLinks(file) +
    "\n";

  html = html.replace(/<\/head>/i, block + "</head>");
  fs.writeFileSync(file, html);
  return "patched";
}

function main() {
  const args = process.argv.slice(2);
  let root = process.cwd();
  const i = args.indexOf("--root");
  if (i >= 0 && args[i + 1]) root = path.resolve(args[i + 1]);

  // 若扫描根落在 kit 目录内：优先用其父目录（期望是智能体 dist 根）
  if (norm(root).includes("white-green-ui-kit")) {
    const parent = path.resolve(kitRoot, "..");
    root = parent;
    console.log(
      "提示：扫描根从 kit 内提升到父目录。合作方请把 kit 放在与 index.html 同级后执行：node white-green-ui-kit/tools/apply.mjs --root .",
    );
  }

  const files = walk(root).filter((f) => {
    const rel = path.relative(root, f);
    return isDetailCandidate(rel, root);
  });

  const stats = { patched: 0, skipAlready: 0, skipNoHead: 0, skipOther: 0 };
  console.log("kit:", kitRoot);
  console.log("scan root:", root);
  console.log("candidates:", files.length);

  for (const f of files) {
    const rel = path.relative(root, f);
    const r = patchHtml(f);
    if (r === "patched") {
      stats.patched += 1;
      console.log("  +", rel);
    } else if (r === "skip-already") {
      stats.skipAlready += 1;
      console.log("  =", rel, "(already)");
    } else if (r === "skip-no-head") {
      stats.skipNoHead += 1;
    } else {
      stats.skipOther += 1;
    }
  }

  console.log("\ndone:", stats);
  console.log(
    "提示：用本地静态服务打开问答 index.html 验收白绿皮；dashboard/business 不应被改。",
  );
}

main();
