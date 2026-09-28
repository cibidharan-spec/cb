// Frame renderer. Every frame is seek(t) + screenshot; the page holds no state between frames.
//   node tools/render.mjs beats           one frame per beat → out/beats/, contact sheet out/beats.png
//   node tools/render.mjs at 3.2 5.01     specific times (seconds) → out/at/
//   node tools/render.mjs cues            dump the SFX cue list → audio/cues.json
//   node tools/render.mjs loop            first frame vs last instant: pixel diff
//   node tools/render.mjs full            4 subframes per 60fps frame → out/sub/ (then tools/encode.sh)
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const beats = JSON.parse(fs.readFileSync(path.join(ROOT, 'audio/beats.json'), 'utf8'));
const B = beats.beat, DUR = 28 * B;
const FPS = 60, SUB = 4, SHUTTER = 0.5;   // 180° shutter, 4 samples
const URL = `file://${ROOT}/index.html?beat=${B}`;
const [mode = 'beats', ...rest] = process.argv.slice(2);

async function page(browser) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1440 }, deviceScaleFactor: 1 });
  p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') console.log('[page]', m.text()); });
  await p.goto(URL);
  await p.waitForFunction(() => window.READY === true);
  return p;
}
async function shot(p, t, file) {
  await p.evaluate(t => window.seek(t), t);
  await p.screenshot({ path: file, type: 'png', animations: 'disabled', caret: 'initial' });
}
const mk = d => (fs.mkdirSync(d, { recursive: true }), d);

const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text'] });
try {
  if (mode === 'beats') {
    const dir = mk(path.join(ROOT, 'out/beats'));
    const offset = +(rest[0] || 0);            // e.g. 0.25 → frames a quarter-beat after each beat
    const p = await page(browser);
    for (let i = 0; i < 28; i++) await shot(p, (i + offset) * B, path.join(dir, `b${String(i + 1).padStart(2, '0')}.png`));
    console.log(`28 beat frames → ${dir}`);
  } else if (mode === 'at') {
    const dir = mk(path.join(ROOT, 'out/at'));
    const p = await page(browser);
    for (const s of rest) await shot(p, +s, path.join(dir, `t${(+s).toFixed(3)}.png`));
  } else if (mode === 'cues') {
    const p = await page(browser);
    const cues = await p.evaluate(() => ({ sfx: window.SFX, ...window.TIMELINE }));
    fs.writeFileSync(path.join(ROOT, 'audio/cues.json'), JSON.stringify(cues, null, 1));
    console.log(`${cues.sfx.length} cues → audio/cues.json`);
  } else if (mode === 'loop') {
    const dir = mk(path.join(ROOT, 'out/loop'));
    const p = await page(browser);
    await shot(p, 0, path.join(dir, 'first.png'));
    await shot(p, DUR - 1e-7, path.join(dir, 'last.png'));
    // state continuity: sample every animated style just before and after the seam
    const diff = await p.evaluate(D => {
      const grab = t => { window.seek(t); return [...document.querySelectorAll('*')].map(e => e.getAttribute('style') + '|' + (e.getAttribute('d') || '')); };
      const a = grab(0), z = grab(D - 1e-7);
      return a.filter((s, i) => s !== z[i]).length;
    }, DUR);
    console.log(`elements whose styles differ between t=0 and t=${DUR}-ε: ${diff}`);
  } else if (mode === 'bounds') {
    // cramped check: the shape's screen box across the loop (min margin to the frame edge)
    const p = await page(browser);
    const r = await p.evaluate(D => {
      let worst = { m: 1e9 }, fill = [];
      for (let i = 0; i < 840; i++) {
        const t = D * i / 840; window.seek(t);
        const q = document.getElementById('shape').getBoundingClientRect();
        const m = Math.min(q.left, q.top, 1440 - q.right, 1440 - q.bottom);
        if (m < worst.m) worst = { m: Math.round(m), t: +t.toFixed(3), w: Math.round(q.width), h: Math.round(q.height) };
        if (i % 30 === 0) fill.push(`${t.toFixed(1)}s:${Math.round(Math.max(q.width, q.height) / 14.4)}%`);
      }
      return { worst, fill };
    }, DUR);
    console.log('tightest margin', r.worst, '\nlargest side as % of frame:', r.fill.join(' '));
  } else if (mode === 'purity') {
    // seek(t) must be a pure function of t: same DOM whatever was drawn before it
    const p = await page(browser);
    const bad = await p.evaluate(D => {
      const snap = () => [...document.querySelectorAll('body *')].filter(e => e.checkVisibility()).map(e => e.id + ':' + (e.getAttribute('style') || '') + '|' + (e.getAttribute('d') || '') + '|' + (e.getAttribute('stroke-dasharray') || '') + '|' + (e.getAttribute('transform') || '') + '|' + (e.children.length ? '' : e.textContent)).join('\n');
      const bad = [];
      for (let i = 0; i < 400; i++) {
        const t = D * i / 400;
        window.seek(t); const a = snap();
        window.seek(Math.random() * D); window.seek(Math.random() * D); window.seek(t); const b = snap();
        if (a !== b) { const A = a.split('\n'), Bs = b.split('\n'); bad.push(t.toFixed(3) + ' ' + (A.find((l, j) => l !== Bs[j]) || 'count').slice(0, 90)); }
      }
      return bad;
    }, DUR);
    console.log(bad.length ? `IMPURE at ${bad.length} times: ${bad.slice(0, 8).join('\n  ')}` : 'pure: 400/400 times identical under random seek history');
  } else if (mode === 'full') {
    const dir = mk(path.join(ROOT, 'out/sub'));
    const frames = Math.round(DUR * FPS), total = frames * SUB;
    const workers = +(process.env.WORKERS || 6);
    const pages = await Promise.all(Array.from({ length: workers }, () => page(browser)));
    let next = 0, done = 0; const t0 = Date.now();
    await Promise.all(pages.map(async p => {
      for (;;) {
        const n = next++; if (n >= total) return;
        const f = Math.floor(n / SUB), s = n % SUB;
        const t = (f + ((s + 0.5) / SUB - 0.5) * SHUTTER) / FPS;   // centered on the frame
        const file = path.join(dir, `${String(n).padStart(5, '0')}.png`);
        if (!fs.existsSync(file)) await shot(p, t, file);
        if (++done % 240 === 0) console.log(`${done}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
    }));
    console.log(`${total} subframes (${frames} frames × ${SUB}) → ${dir}`);
  }
} finally {
  await browser.close();
}
