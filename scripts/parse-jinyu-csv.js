/**
 * One-off: parse sys_tenant_bak.csv → agents/group-ledger/jinyu-org-enterprises.js
 * Usage: node scripts/parse-jinyu-csv.js [csvPath]
 */
'use strict';

const fs = require('fs');
const path = require('path');

const csvPath =
  process.argv[2] ||
  'd:/xwechat_files/yanwei7847_7b26/temp/RWTemp/2026-07/622fb1941a6da4943056b30141087341/sys_tenant_bak.csv';
const outPath = path.join(__dirname, '../agents/group-ledger/jinyu-org-enterprises.js');

function parseCsvLine(line) {
  const cols = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') {
      cols.push(cur);
      cur = '';
    } else cur += ch;
  }
  cols.push(cur);
  return cols;
}

function buildKeywords(name, shortName, region) {
  const kw = new Set();
  [name, shortName, region].forEach(function (s) {
    if (!s) return;
    String(s)
      .split(/[\s·\-—\/（）()、，,]+/)
      .map(function (x) {
        return x.trim();
      })
      .filter(function (x) {
        return x.length >= 2;
      })
      .forEach(function (x) {
        kw.add(x);
      });
  });
  if (/水泥/.test(name)) kw.add('水泥');
  if (/冀东/.test(name)) kw.add('冀东');
  if (/北水/.test(name)) kw.add('北水');
  if (/粉磨/.test(name)) kw.add('粉磨');
  if (/熟料/.test(name)) kw.add('熟料');
  if (/金隅/.test(name)) kw.add('金隅');
  return Array.from(kw).slice(0, 12);
}

function inferRegion(name) {
  const m = String(name).match(
    /(北京|天津|河北|山西|内蒙古|辽宁|吉林|黑龙江|上海|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|广西|海南|重庆|四川|贵州|云南|西藏|陕西|甘肃|青海|宁夏|新疆|唐山|承德|保定|石家庄|邯郸|邢台|张家口|秦皇岛|廊坊|沧州|衡水)/
  );
  return m ? m[1] : '';
}

let raw = fs.readFileSync(csvPath, 'utf8');
if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
const lines = raw.split(/\r?\n/).filter(Boolean);
const header = parseCsvLine(lines[0]).map(function (h) {
  return h.replace(/^\uFEFF/, '').trim();
});
const idx = {};
header.forEach(function (h, i) {
  idx[h] = i;
});
if (idx.f_id == null) {
  console.error('Missing f_id column. Header:', header.slice(0, 5));
  process.exit(1);
}

const seen = new Set();
const enterprises = [];

for (let i = 1; i < lines.length; i++) {
  const row = parseCsvLine(lines[i]);
  const id = row[idx.f_id];
  const full = (row[idx.f_tenant_full_name] || '').trim();
  const short = (row[idx.f_tenant_name] || '').trim();
  const parentId = (row[idx.f_parent_id] || '0').trim();
  const status = (row[idx.f_tenant_status] || '1').trim();
  const regionCol = (row[idx.f_own_manage_region] || '').trim();

  if (!id || !full || full === '-' || !short || short === '-') continue;
  if (status && status !== '1') continue;
  if (seen.has(id)) continue;
  seen.add(id);

  const name = full;
  const region = regionCol || inferRegion(name);
  enterprises.push({
    id: 'jy-' + id,
    csvId: id,
    name: name,
    shortName: short,
    parentId: parentId,
    region: region,
    keywords: buildKeywords(name, short, region),
  });
}

enterprises.sort(function (a, b) {
  return a.name.localeCompare(b.name, 'zh-CN');
});

const js =
  '/**\n' +
  ' * 金隅集团组织架构（自 sys_tenant_bak.csv 离线导入）\n' +
  ' * 生成时间：' +
  new Date().toISOString().slice(0, 10) +
  ' · 共 ' +
  enterprises.length +
  ' 条有效租户\n' +
  ' */\n' +
  'var JinyuOrgEnterprises = ' +
  JSON.stringify(enterprises, null, 2) +
  ';\n';

fs.writeFileSync(outPath, js, 'utf8');
console.log('Wrote', outPath, 'enterprises:', enterprises.length);
console.log(
  'Sample:',
  enterprises
    .filter(function (e) {
      return /水泥|冀东/.test(e.name);
    })
    .slice(0, 5)
    .map(function (e) {
      return e.name;
    })
);
