#!/usr/bin/env node
// Gabungkan screenshot hasil running + screenshot Allure + link repo menjadi 1 PDF.
//
// Contoh:
//   npm run pdf -- --repo https://github.com/USERNAME/BelajarBarengApps-Automation \
//     --name "Nama Kamu" --nim 12345678 \
//     --run-shots evidence/01_login_berhasil.png --run-shots evidence/terminal_test.png \
//     --allure-shots evidence/allure_overview.png --allure-shots evidence/allure_detail.png
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { PDFDocument, PDFName, PDFString, StandardFonts, rgb } from 'pdf-lib';

const { values } = parseArgs({
  options: {
    repo: { type: 'string' },
    name: { type: 'string', default: '' },
    nim: { type: 'string', default: '' },
    'run-shots': { type: 'string', multiple: true },
    'allure-shots': { type: 'string', multiple: true },
    output: { type: 'string', default: 'submission/Tugas_Automation_BelajarBarengApps.pdf' },
  },
});

const runShots = values['run-shots'] ?? [];
const allureShots = values['allure-shots'] ?? [];
if (!values.repo || runShots.length === 0 || allureShots.length === 0) {
  console.error('Wajib isi: --repo, minimal satu --run-shots, dan minimal satu --allure-shots (flag boleh diulang).');
  process.exit(1);
}
const missing = [...runShots, ...allureShots].filter((f) => !fs.existsSync(f));
if (missing.length) {
  console.error(`File screenshot tidak ditemukan:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}

const PAGE = [595.28, 841.89]; // A4
const M = 50;
const pdf = await PDFDocument.create();
pdf.setTitle('Laporan Automation BelajarBarengApps');
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

let page;
let y;
const newPage = () => {
  page = pdf.addPage(PAGE);
  y = PAGE[1] - M;
};
const ensure = (h) => {
  if (y - h < M) newPage();
};

function wrap(text, f, size, maxW) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (f.widthOfTextAtSize(test, size) > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function paragraph(text, { f = font, size = 11, color = rgb(0, 0, 0), gap = 4 } = {}) {
  for (const line of wrap(text, f, size, PAGE[0] - 2 * M)) {
    ensure(size + gap);
    page.drawText(line, { x: M, y: y - size, size, font: f, color });
    y -= size + gap;
  }
}

function link(label, url) {
  let size = 11;
  const maxW = PAGE[0] - 2 * M;
  while (font.widthOfTextAtSize(url, size) > maxW && size > 6) size -= 0.5;
  ensure(size + 6);
  const w = font.widthOfTextAtSize(url, size);
  page.drawText(label, { x: M, y: y - size, size: 11, font: bold });
  y -= 11 + 4;
  page.drawText(url, { x: M, y: y - size, size, font, color: rgb(0.05, 0.25, 0.8) });
  page.drawLine({
    start: { x: M, y: y - size - 1.5 },
    end: { x: M + w, y: y - size - 1.5 },
    thickness: 0.6,
    color: rgb(0.05, 0.25, 0.8),
  });
  const annot = pdf.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [M, y - size - 2, M + w, y + 2],
    Border: [0, 0, 0],
    A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) },
  });
  const ref = pdf.context.register(annot);
  const existing = page.node.lookup(PDFName.of('Annots'));
  if (existing && typeof existing.push === 'function') existing.push(ref);
  else page.node.set(PDFName.of('Annots'), pdf.context.obj([ref]));
  y -= size + 10;
}

async function image(file) {
  const bytes = fs.readFileSync(file);
  const ext = path.extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
    console.error(`Format tidak didukung (pakai PNG/JPG): ${file}`);
    process.exit(1);
  }
  const img = ext === '.png' ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
  const scale = Math.min((PAGE[0] - 2 * M) / img.width, 520 / img.height, 1);
  const w = img.width * scale;
  const h = img.height * scale;
  ensure(h + 30);
  page.drawImage(img, { x: (PAGE[0] - w) / 2, y: y - h, width: w, height: h });
  y -= h + 12;
  const caption = path.basename(file);
  const cw = font.widthOfTextAtSize(caption, 9);
  page.drawText(caption, { x: (PAGE[0] - cw) / 2, y: y - 9, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 9 + 18;
}

newPage();
paragraph('Laporan Automation Testing - BelajarBarengApps', { f: bold, size: 18, gap: 8 });
y -= 6;
if (values.name || values.nim) paragraph(`Nama: ${values.name}    NIM: ${values.nim}`);
y -= 4;
link('Link repository:', values.repo);
paragraph(
  'Automation dibuat dengan WebdriverIO, Appium (UiAutomator2), Mocha, dan Allure Report. ' +
    "Skenario: login dengan akun valid, lalu assert notifikasi 'Login berhasil' tampil."
);
y -= 14;
paragraph('1. Screenshot hasil running (berhasil)', { f: bold, size: 14, gap: 8 });
y -= 4;
for (const f of runShots) await image(f);

newPage();
paragraph('2. Screenshot Allure Report', { f: bold, size: 14, gap: 8 });
y -= 4;
for (const f of allureShots) await image(f);

fs.mkdirSync(path.dirname(path.resolve(values.output)), { recursive: true });
fs.writeFileSync(values.output, await pdf.save({ useObjectStreams: false }));
console.log(`PDF dibuat: ${values.output}`);
