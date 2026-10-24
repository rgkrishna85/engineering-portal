// Builds one self-study PowerPoint deck per day (plus a course overview) into ../
//   cd learning/langgraph/slides/build && npm install && npm run build
// Lesson text comes from ../../week-*.md (parse.js); extra self-study material from extras.js.
const path = require("path");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require("./apply_theme.js");
const { loadLessons } = require("./parse.js");
const EXTRAS = require("./extras.js");

const OUT_DIR = path.join(__dirname, "..");
const W = 10;
const H = 5.625;
const M = 0.5;

const THEME = {
  name: "LangGraph Help Desk",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1F2328", lt1: "FFFFFF", dk2: "0E3B43", lt2: "EAF3F1",
    accent1: "0E7C7B", accent2: "F2A541", accent3: "D9534F", accent4: "5B8E7D",
    accent5: "1E2A32", accent6: "C9DEDA", hlink: "0E7C7B", folHlink: "5B8E7D",
  },
};
const HEX = THEME.colors;
const MONO = "Courier New";

// ---------- text helpers ----------

const stripEmoji = (s) => s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").replace(/\s{2,}/g, " ").trim();
const plain = (s) => stripEmoji(s).replace(/\*\*|\*|`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/<(https?:[^>]+)>/g, "$1");
const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const pad2 = (n) => String(n).padStart(2, "0");
const slug = (s) => plain(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").split("-").reduce((acc, w) => (acc.length + w.length < 46 ? (acc ? acc + "-" : "") + w : acc), "");

// Markdown-ish inline text -> pptxgenjs runs: **bold**, *italic*, `code`, [link](url).
function runs(text, base = {}) {
  const src = stripEmoji(text).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/<(https?:[^>]+)>/g, "$1");
  const out = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ text: src.slice(last, m.index), options: { ...base } });
    const tok = m[0];
    if (tok.startsWith("**")) out.push({ text: tok.slice(2, -2), options: { ...base, bold: true } });
    else if (tok.startsWith("`")) out.push({ text: tok.slice(1, -1), options: { ...base, fontFace: MONO, color: base.codeColor || base.color } });
    else out.push({ text: tok.slice(1, -1), options: { ...base, italic: true } });
    last = m.index + tok.length;
  }
  if (last < src.length) out.push({ text: src.slice(last), options: { ...base } });
  out.forEach((r) => delete r.options.codeColor);
  return out;
}

// Rough fit check: Calibri averages ~0.5em per character, Courier New 0.6em.
function linesFor(text, widthIn, pt, em = 0.52) {
  const perLine = Math.max(1, Math.floor((widthIn * 72) / (pt * em)));
  // Inline `code` renders in Courier New, which is ~30% wider than Calibri.
  const len = (para) => plain(para).length + 0.35 * (para.match(/`[^`]*`/g) || []).join("").length;
  return String(text).split("\n").reduce((n, para) => n + Math.max(1, Math.ceil(len(para) / perLine)), 0);
}
const heightFor = (text, widthIn, pt, em, spacing = 1.2) => (linesFor(text, widthIn, pt, em) * pt * spacing) / 72;
function fitSize(text, widthIn, heightIn, sizes, em) {
  for (const pt of sizes) if (heightFor(text, widthIn, pt, em) <= heightIn) return pt;
  return null;
}

// ---------- deck ----------

function newDeck(meta) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.author = "Engineering Portal LangGraph program";
  pres.title = meta.deckTitle;
  pres.subject = "LangGraph self-study guide";
  const C = pres.SchemeColor;

  const footer = (color) => [
    { text: { text: meta.footer, options: { x: M, y: H - 0.38, w: 7.5, h: 0.25, fontSize: 9, color, margin: 0, isTextBox: true } } },
  ];
  pres.defineSlideMaster({
    title: "DARK",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.45, w: 9, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.85, w: 9, h: 1.3, fontSize: 36, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } },
      ...footer(C.accent6),
    ],
    slideNumber: { x: W - M - 0.6, y: H - 0.38, w: 0.6, h: 0.25, fontSize: 9, color: C.accent6, align: "right" },
  });
  pres.defineSlideMaster({
    title: "CONTENT",
    background: { color: C.background1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.3, w: 9, h: 0.65, fontSize: 28, bold: true, color: C.text2, valign: "middle", align: "left", margin: 0 }, text: "" } },
      ...footer(C.accent4),
    ],
    slideNumber: { x: W - M - 0.6, y: H - 0.38, w: 0.6, h: 0.25, fontSize: 9, color: C.accent4, align: "right" },
  });
  return { pres, C };
}

function contentSlide(ctx, title) {
  const slide = ctx.pres.addSlide({ masterName: "CONTENT" });
  slide.addText(title, { placeholder: "title" });
  return slide;
}

// A numbered "graph node" circle: the deck's visual motif.
function node(ctx, slide, x, y, label, { size = 0.42, fill = ctx.C.accent1, color = ctx.C.background1, fontSize = 14 } = {}) {
  slide.addShape(ctx.pres.shapes.OVAL, { x, y, w: size, h: size, fill: { color: fill }, line: { color: fill }, objectName: `node ${label}` });
  slide.addText(String(label), { x, y, w: size, h: size, fontSize, bold: true, color, align: "center", valign: "middle", margin: 0, isTextBox: true });
}

function card(ctx, slide, x, y, w, h, fill = ctx.C.background2, name = "card") {
  slide.addShape(ctx.pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.1, fill: { color: fill }, line: { color: fill }, objectName: name });
}

// Monospace lines that fit a box: with wrap, long lines flow onto extra rows.
function monoFit(text, w, h, { wrap = false, max = 12, min = 8 } = {}) {
  const lines = text.split("\n");
  for (let pt = max; pt >= min; pt -= 0.5) {
    const perLine = Math.floor((w * 72) / (pt * (wrap ? 0.67 : 0.61)));
    const rows = wrap ? lines.reduce((n, l) => n + Math.max(1, Math.ceil(l.length / perLine)), 0) : lines.length;
    const fitsWidth = wrap || Math.max(...lines.map((l) => l.length)) <= perLine;
    if (fitsWidth && rows * pt * 1.2 <= h * 72) return { pt, rows };
  }
  return { pt: min, rows: lines.length };
}

// Dark code panel. fit: true shrinks the panel's height to its content.
function codePanel(ctx, slide, x, y, w, h, code, label, { wrap = false, fit = false, max = 12 } = {}) {
  const head = label ? 0.35 : 0;
  const { pt, rows } = monoFit(code, w - 0.4, h - 0.3 - head, { wrap, max });
  const panelH = fit ? Math.min(h, 0.3 + head + (rows * pt * 1.2) / 72 + 0.1) : h;
  slide.addShape(ctx.pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: panelH, rectRadius: 0.1, fill: { color: ctx.C.accent5 }, line: { color: ctx.C.accent5 }, objectName: "code panel" });
  let top = y + 0.15;
  if (label) {
    slide.addText(label, { x: x + 0.2, y: top, w: w - 0.4, h: 0.25, fontSize: 10, color: ctx.C.accent2, bold: true, margin: 0, isTextBox: true });
    top += 0.35;
  }
  slide.addText(code, { x: x + 0.2, y: top, w: w - 0.4, h: y + panelH - 0.15 - top, fontFace: MONO, fontSize: pt, color: ctx.C.background1, valign: "top", margin: 0, wrap, isTextBox: true, objectName: "code" });
  return panelH;
}

// ---------- slide builders ----------

function titleSlide(ctx, d, x) {
  const s = ctx.pres.addSlide({ masterName: "DARK" });
  const kind = x.kind === "milestone" ? "MILESTONE" : x.kind === "capstone" ? "CAPSTONE" : "SELF-STUDY";
  s.addText(`WEEK ${d.week}  ·  DAY ${pad2(d.day)}  ·  30 MIN ${kind}`, { placeholder: "kicker" });
  s.addText(d.cleanTitle, { placeholder: "title" });
  const goal = capitalise(d.goal || plain(x.brief || ""));
  s.addText(runs(goal, { color: ctx.C.accent6 }), { x: M, y: 2.25, w: 4.6, h: 2.4, fontSize: 16, valign: "top", margin: 0, isTextBox: true, objectName: "goal" });

  card(ctx, s, 5.5, 2.15, 4.0, 2.6, ctx.C.accent5, "outcomes card");
  s.addText("BY THE END YOU CAN", { x: 5.75, y: 2.3, w: 3.6, h: 0.3, fontSize: 11, bold: true, color: ctx.C.accent2, charSpacing: 1, margin: 0, isTextBox: true });
  (x.outcomes || []).slice(0, 3).forEach((o, i) => {
    const y = 2.75 + i * 0.62;
    node(ctx, s, 5.75, y + 0.04, i + 1, { size: 0.36, fill: ctx.C.accent2, color: ctx.C.text2, fontSize: 12 });
    s.addText(o, { x: 6.25, y, w: 3.1, h: 0.5, fontSize: 13, color: ctx.C.background1, valign: "middle", margin: 0, isTextBox: true });
  });
}

function beforeSlide(ctx, d, x) {
  const s = contentSlide(ctx, "Before you start");
  const prep = x.prep || {};
  const checklist = [
    ["Switch on Python (VS Code terminal)", "cd learning\\langgraph\\code\n.venv\\Scripts\\activate"],
  ];
  if (d.compare) checklist.push(["Today's reference file", d.compare]);
  checklist.push(prep.key
    ? ["AI key needed", "ANTHROPIC_API_KEY in code\\.env (see setup guide)"]
    : ["No AI key needed today", "Everything runs free and offline"]);
  if (prep.portal) checklist.push(["Portal running (2nd terminal, repo root)", "npm run dev   →   http://localhost:3000"]);

  card(ctx, s, M, 1.15, 4.5, 3.75, ctx.C.background2, "checklist card");
  s.addText("CHECKLIST", { x: M + 0.25, y: 1.3, w: 4, h: 0.3, fontSize: 11, bold: true, color: ctx.C.accent1, charSpacing: 1, margin: 0, isTextBox: true });
  let y = 1.7;
  const rowH = checklist.length > 3 ? 0.78 : 0.95;
  checklist.forEach(([label, detail]) => {
    node(ctx, s, M + 0.25, y + 0.02, "", { size: 0.22, fill: ctx.C.accent1 });
    s.addText(label, { x: M + 0.6, y: y - 0.04, w: 3.8, h: 0.3, fontSize: 14, bold: true, color: ctx.C.text1, margin: 0, isTextBox: true });
    s.addText(detail, { x: M + 0.6, y: y + 0.27, w: 3.8, h: rowH - 0.35, fontFace: MONO, fontSize: 11, color: ctx.C.text2, valign: "top", margin: 0, isTextBox: true });
    y += rowH;
  });

  // The 30 minutes as a little graph: nodes joined by a line.
  const plan = x.kind
    ? [["0–5", "Read the brief and the steps"], ["5–25", "Build it with your AI assistant"], ["25–30", "Score yourself with the rubric"]]
    : [["0–8", "Understand: picture + key ideas"], ["8–13", "Read and run the example code"], ["13–23", "Build it yourself with AI"], ["23–30", "Check task, mistakes, quiz"]];
  s.addText("YOUR 30 MINUTES", { x: 5.4, y: 1.3, w: 4, h: 0.3, fontSize: 11, bold: true, color: ctx.C.accent1, charSpacing: 1, margin: 0, isTextBox: true });
  const step = 3.1 / plan.length;
  s.addShape(ctx.pres.shapes.LINE, { x: 5.61, y: 1.95, w: 0, h: step * (plan.length - 1), line: { color: ctx.C.accent6, width: 2 }, objectName: "timeline" });
  plan.forEach(([mins, what], i) => {
    const ty = 1.75 + i * step;
    node(ctx, s, 5.4, ty, i + 1, { size: 0.42 });
    s.addText(`${mins} min`, { x: 6.0, y: ty - 0.05, w: 3.4, h: 0.28, fontSize: 12, bold: true, color: ctx.C.accent1, margin: 0, isTextBox: true });
    s.addText(what, { x: 6.0, y: ty + 0.2, w: 3.4, h: 0.3, fontSize: 14, color: ctx.C.text1, margin: 0, isTextBox: true });
  });
}

function pictureSlide(ctx, d) {
  if (!d.layman) return;
  const s = contentSlide(ctx, "The picture in plain words");
  const text = capitalise(d.layman);
  if (d.diagram) {
    const pt = fitSize(text, 8.0, 1.25, [20, 18, 17, 16, 15, 14], 0.5) || 14;
    const textH = Math.max(0.6, heightFor(text, 8.0, pt, 0.5, 1.25)) + 0.1;
    card(ctx, s, M, 1.15, 9, textH + 0.4, ctx.C.background2, "analogy card");
    s.addText("“", { x: M + 0.2, y: 1.1, w: 0.6, h: 0.7, fontSize: 44, bold: true, color: ctx.C.accent2, margin: 0, isTextBox: true });
    s.addText(runs(text, { color: ctx.C.text1, codeColor: ctx.C.accent1 }), { x: M + 0.75, y: 1.35, w: 8.0, h: textH, fontSize: pt, valign: "top", margin: 0, isTextBox: true, objectName: "analogy" });
    const top = 1.15 + textH + 0.65;
    s.addText("THE FLOOR PLAN", { x: M, y: top, w: 4.6, h: 0.3, fontSize: 11, bold: true, color: ctx.C.accent1, charSpacing: 1, margin: 0, isTextBox: true });
    codePanel(ctx, s, M, top + 0.35, 9, 4.9 - top - 0.35, d.diagram, null, { fit: true, max: 14 });
  } else {
    card(ctx, s, M, 1.15, 9, 3.75, ctx.C.background2, "analogy card");
    s.addText("“", { x: M + 0.3, y: 1.2, w: 0.8, h: 0.9, fontSize: 60, bold: true, color: ctx.C.accent2, margin: 0, isTextBox: true });
    const pt = fitSize(text, 7.9, 2.9, [22, 20, 18, 17, 16, 15], 0.5) || 15;
    s.addText(runs(text, { color: ctx.C.text1, codeColor: ctx.C.accent1 }), { x: M + 0.55, y: 1.95, w: 7.9, h: 2.8, fontSize: pt, valign: "top", margin: 0, isTextBox: true, objectName: "analogy" });
  }
}

function ideasSlides(ctx, concepts, heading = "Key ideas") {
  const items = concepts.map((c) => (typeof c === "string" ? c : c.code ? `${c.text} *(see the code slide)*` : c.text));
  if (!items.length) return;
  // Pack items onto slides: one slide at 15pt, or at 14/13pt if that avoids a second slide.
  const textW = 8.35;
  const rowH = (it, pt) => Math.max(0.45, heightFor(it, textW, pt, 0.52, 1.2)) + 0.17;
  const pt = [15, 14, 13].find((size) => items.reduce((sum, it) => sum + rowH(it, size), 0) <= 3.85) || 15;
  const pages = [[]];
  let used = 0;
  for (const it of items) {
    const h = rowH(it, pt);
    if (used + h > 3.85 && pages[pages.length - 1].length) { pages.push([]); used = 0; }
    pages[pages.length - 1].push({ it, h });
    used += h;
  }
  let n = 0;
  pages.forEach((page, p) => {
    const s = contentSlide(ctx, pages.length > 1 ? `${heading} (${p + 1}/${pages.length})` : heading);
    let y = 1.2;
    for (const { it, h } of page) {
      n += 1;
      node(ctx, s, M, y + 0.02, n, { size: 0.42 });
      s.addText(runs(it, { color: ctx.C.text1, codeColor: ctx.C.accent1 }), { x: M + 0.65, y, w: textW, h: h - 0.15, fontSize: pt, valign: "top", margin: 0, isTextBox: true, objectName: `idea ${n}` });
      y += h;
    }
  });
}

function codeSlide(ctx, x) {
  if (!x.code) return;
  const s = contentSlide(ctx, "See it in code");
  codePanel(ctx, s, M, 1.15, 5.5, 3.75, x.code.lines, x.code.file);
  x.code.notes.forEach(([label, text], i) => {
    const y = 1.15 + i * 1.28;
    card(ctx, s, 6.2, y, 3.3, 1.15, ctx.C.background2, `note ${i + 1}`);
    node(ctx, s, 6.35, y + 0.15, i + 1, { size: 0.34, fontSize: 12 });
    s.addText(label, { x: 6.8, y: y + 0.12, w: 2.6, h: 0.4, fontSize: 13, bold: true, color: ctx.C.text2, valign: "middle", margin: 0, isTextBox: true });
    const pt = fitSize(text, 3.0, 0.6, [12, 11.5, 11, 10.5, 10], 0.5) || 10;
    s.addText(text, { x: 6.35, y: y + 0.52, w: 3.05, h: 0.6, fontSize: pt, color: ctx.C.text1, valign: "top", margin: 0, isTextBox: true });
  });
}

function runSlide(ctx, d, x) {
  if (!x.run) return;
  const s = contentSlide(ctx, "Run it and compare");
  const steps = [
    ["Switch on Python", ".venv\\Scripts\\activate"],
    ["Run the example", x.run.cmd.split("\n").pop()],
    ["Compare the output", "Same shape as below? It works."],
    ["Change one thing", "Predict the result, run again."],
  ];
  const colW = 9 / steps.length;
  s.addShape(ctx.pres.shapes.LINE, { x: M + 0.21, y: 1.36, w: colW * 3, h: 0, line: { color: ctx.C.accent6, width: 2 }, objectName: "steps line" });
  steps.forEach(([label, detail], i) => {
    const x0 = M + i * colW;
    node(ctx, s, x0, 1.15, i + 1, { size: 0.42 });
    s.addText(label, { x: x0, y: 1.67, w: colW - 0.15, h: 0.28, fontSize: 13, bold: true, color: ctx.C.text1, margin: 0, isTextBox: true });
    const mono = i < 2;
    s.addText(detail, { x: x0, y: 1.95, w: colW - 0.15, h: 0.45, fontSize: mono ? 9.5 : 11, fontFace: mono ? MONO : undefined, color: mono ? ctx.C.accent1 : ctx.C.text1, valign: "top", margin: 0, isTextBox: true });
  });
  const pre = x.run.cmd.includes("\n") ? x.run.cmd.split("\n").slice(0, -1).map((c) => `# ${c}\n`).join("") : "";
  const term = `${pre}> ${x.run.cmd.split("\n").pop()}\n${x.run.out}`;
  codePanel(ctx, s, M, 2.5, 9, 2.4, term, "EXPECTED OUTPUT", { wrap: true, max: 11.5 });
}

function buildSlide(ctx, d, x) {
  const prompt = x.prompt || d.prompt;
  if (!prompt) return;
  const s = contentSlide(ctx, x.kind ? "Starter prompt for your AI assistant" : "Build it yourself with AI");
  s.addText("PASTE INTO CLAUDE CODE / COPILOT CHAT", { x: M, y: 1.12, w: 6, h: 0.28, fontSize: 11, bold: true, color: ctx.C.accent1, charSpacing: 1, margin: 0, isTextBox: true });
  card(ctx, s, M, 1.45, 5.9, 3.45, ctx.C.background2, "prompt card");
  const { pt } = monoFit(prompt, 5.5, 3.15, { wrap: true, max: 12.5, min: 9 });
  s.addText(prompt, { x: M + 0.2, y: 1.6, w: 5.5, h: 3.15, fontFace: MONO, fontSize: pt, color: ctx.C.text2, valign: "top", margin: 0, isTextBox: true, objectName: "prompt" });

  const then = x.kind
    ? (x.tips || []).map((t) => ["Tip", t])
    : [
        ["Run it", "Run the generated file right away."],
        ["Ask why", "\"Explain this line by line for a C# developer.\""],
        ["Break it", "Try odd inputs: capitals, empty text, typos."],
        ["Compare", d.compare ? `Open ${d.compare} and spot the differences.` : "Compare with a colleague's version."],
      ];
  s.addText(x.kind ? "TIPS" : "THEN", { x: 6.7, y: 1.12, w: 2.8, h: 0.28, fontSize: 11, bold: true, color: ctx.C.accent1, charSpacing: 1, margin: 0, isTextBox: true });
  const gap = 3.45 / then.length;
  then.forEach(([label, text], i) => {
    const y = 1.5 + i * gap;
    node(ctx, s, 6.7, y, i + 1, { size: 0.34, fontSize: 12, fill: ctx.C.accent2, color: ctx.C.text2 });
    if (x.kind) {
      const tpt = fitSize(text, 2.35, gap - 0.15, [13, 12.5, 12, 11.5, 11], 0.5) || 11;
      s.addText(text, { x: 7.15, y: y - 0.02, w: 2.35, h: gap - 0.1, fontSize: tpt, color: ctx.C.text1, valign: "top", margin: 0, isTextBox: true });
    } else {
      s.addText(label, { x: 7.15, y: y - 0.03, w: 2.35, h: 0.3, fontSize: 14, bold: true, color: ctx.C.text1, margin: 0, isTextBox: true });
      s.addText(text, { x: 7.15, y: y + 0.27, w: 2.35, h: gap - 0.35, fontSize: 11.5, color: ctx.C.text1, valign: "top", margin: 0, isTextBox: true });
    }
  });
}

function checkSlide(ctx, d, x) {
  if (!d.check && !x.mistakes) return;
  const s = contentSlide(ctx, "Check yourself and watch out");
  card(ctx, s, M, 1.15, 4.3, 3.75, ctx.C.text2, "check task card");
  s.addText("YOUR CHECK TASK", { x: M + 0.25, y: 1.32, w: 3.8, h: 0.3, fontSize: 11, bold: true, color: ctx.C.accent2, charSpacing: 1, margin: 0, isTextBox: true });
  const text = capitalise(d.check || "");
  const pt = fitSize(text, 3.8, 2.0, [16, 15, 14, 13], 0.5) || 13;
  s.addText(runs(text, { color: ctx.C.background1, codeColor: ctx.C.accent2 }), { x: M + 0.25, y: 1.7, w: 3.8, h: 2.05, fontSize: pt, valign: "top", margin: 0, isTextBox: true, objectName: "check task" });
  s.addText([
    { text: "Score: ", options: { bold: true, color: ctx.C.accent2 } },
    { text: "3 works and you can explain it · 2 works with help · 1 attempted · 0 not tried", options: { color: ctx.C.accent6 } },
  ], { x: M + 0.25, y: 3.95, w: 3.8, h: 0.8, fontSize: 11, valign: "top", margin: 0, isTextBox: true });

  s.addText("COMMON MISTAKES", { x: 5.1, y: 1.15, w: 4.4, h: 0.3, fontSize: 11, bold: true, color: ctx.C.accent3, charSpacing: 1, margin: 0, isTextBox: true });
  (x.mistakes || []).forEach(([problem, fix], i) => {
    const y = 1.55 + i * 1.12;
    node(ctx, s, 5.1, y, "!", { size: 0.34, fill: ctx.C.accent3, fontSize: 13 });
    s.addText(problem, { x: 5.6, y: y - 0.03, w: 3.9, h: 0.4, fontSize: 13, bold: true, color: ctx.C.text1, valign: "top", margin: 0, isTextBox: true });
    s.addText(fix, { x: 5.6, y: y + 0.38, w: 3.9, h: 0.62, fontSize: 12, color: ctx.C.text1, valign: "top", margin: 0, isTextBox: true });
  });
}

function quizSlides(ctx, d) {
  if (!d.quiz.length) return;
  const make = (title, items, hint, color) => {
    const s = contentSlide(ctx, title);
    const gap = 3.6 / items.length;
    items.forEach((q, i) => {
      const y = 1.2 + i * gap;
      node(ctx, s, M, y, i + 1, { size: 0.42, fill: color });
      const pt = fitSize(q, 8.3, gap - 0.12, [16, 15, 14, 13, 12], 0.5) || 12;
      s.addText(runs(q, { color: ctx.C.text1, codeColor: ctx.C.accent1 }), { x: M + 0.65, y: y + 0.02, w: 8.35, h: gap - 0.08, fontSize: pt, valign: "top", margin: 0, isTextBox: true });
    });
    s.addText(hint, { x: M, y: 4.85, w: 7, h: 0.25, fontSize: 10, italic: true, color: ctx.C.accent4, margin: 0, isTextBox: true });
  };
  make("Quiz: 5 questions", d.quiz, "Answer each one aloud or on paper before you look at the next slide. 1 point each.", ctx.C.accent1);
  make("Quiz answers", d.answers, "Got 4–5 right? Great. Fewer? Re-read the key ideas slide and try the quiz again tomorrow.", ctx.C.accent4);
}

function briefSlide(ctx, d, x) {
  const s = contentSlide(ctx, "Your mission");
  const diagram = x.diagram || (x.kind === "capstone" ? CAPSTONE_DIAGRAM : null);
  if (diagram) {
    const pt = fitSize(x.brief, 9, 1.05, [17, 16, 15, 14], 0.5) || 14;
    s.addText(runs(x.brief, { color: ctx.C.text1, codeColor: ctx.C.accent1 }), { x: M, y: 1.15, w: 9, h: 1.1, fontSize: pt, valign: "top", margin: 0, isTextBox: true, objectName: "brief" });
    codePanel(ctx, s, M, 2.45, 9, 2.45, diagram, "THE DESIGN", { fit: true, max: 14 });
  } else {
    const bh = Math.min(3.1, heightFor(x.brief, 8.2, 20, 0.5, 1.25) + 0.2);
    card(ctx, s, M, 1.15, 9, bh + 0.7, ctx.C.background2, "brief card");
    s.addText(runs(x.brief, { color: ctx.C.text1, codeColor: ctx.C.accent1 }), { x: M + 0.4, y: 1.5, w: 8.2, h: bh, fontSize: 20, valign: "top", margin: 0, isTextBox: true, objectName: "brief" });
  }
}

function stepsSlide(ctx, x) {
  const s = contentSlide(ctx, "Step by step");
  const gap = 3.7 / x.steps.length;
  s.addShape(ctx.pres.shapes.LINE, { x: M + 0.21, y: 1.4, w: 0, h: gap * (x.steps.length - 1), line: { color: ctx.C.accent6, width: 2 }, objectName: "steps line" });
  x.steps.forEach((st, i) => {
    const y = 1.2 + i * gap;
    node(ctx, s, M, y, i + 1, { size: 0.42 });
    const pt = fitSize(st, 8.3, gap - 0.1, [16, 15, 14, 13], 0.5) || 13;
    s.addText(runs(st, { color: ctx.C.text1, codeColor: ctx.C.accent1 }), { x: M + 0.65, y: y + 0.03, w: 8.35, h: gap - 0.05, fontSize: pt, valign: "top", margin: 0, isTextBox: true });
  });
}

function rubricSlide(ctx, x) {
  const s = contentSlide(ctx, "How you are scored");
  const total = x.rubric.reduce((n, [, p]) => n + p, 0);
  const head = { bold: true, color: ctx.C.background1, fill: { color: ctx.C.accent1 } };
  const rows = [[{ text: "Criterion", options: head }, { text: "Points", options: { ...head, align: "center" } }]];
  x.rubric.forEach(([c, p], i) => {
    const fill = { color: i % 2 ? ctx.C.background1 : ctx.C.background2 };
    rows.push([{ text: c, options: { fill, color: ctx.C.text1 } }, { text: String(p), options: { fill, color: ctx.C.text1, align: "center", bold: true } }]);
  });
  rows.push([{ text: "Total", options: { bold: true, color: ctx.C.text2 } }, { text: String(total), options: { bold: true, color: ctx.C.text2, align: "center" } }]);
  s.addTable(rows, { x: M, y: 1.2, w: 6.2, colW: [5.1, 1.1], fontSize: 13, rowH: 0.42, border: { type: "solid", pt: 0.5, color: HEX.accent6 }, valign: "middle", objectName: "rubric" });

  card(ctx, s, 7.0, 1.2, 2.5, 3.6, ctx.C.text2, "score card");
  s.addText(String(total), { x: 7.0, y: 1.5, w: 2.5, h: 1.1, fontSize: 60, bold: true, color: ctx.C.accent2, align: "center", margin: 0, isTextBox: true });
  s.addText("points available", { x: 7.0, y: 2.6, w: 2.5, h: 0.3, fontSize: 12, color: ctx.C.accent6, align: "center", margin: 0, isTextBox: true });
  const bands = total >= 20
    ? "16–20  ready to move on\n10–15  revisit weak parts\n0–9     pair with a buddy"
    : `${Math.round(total * 0.8)}–${total}  ready to move on\n${Math.round(total * 0.5)}–${Math.round(total * 0.8) - 1}  revisit weak parts\n0–${Math.round(total * 0.5) - 1}     pair with a buddy`;
  s.addText(bands, { x: 7.2, y: 3.1, w: 2.2, h: 1.4, fontSize: 12, color: ctx.C.background1, valign: "top", margin: 0, isTextBox: true });
}

function summarySlide(ctx, d, x, next) {
  const s = ctx.pres.addSlide({ masterName: "DARK" });
  s.addText(`DAY ${pad2(d.day)} WRAP-UP`, { placeholder: "kicker" });
  s.addText("Key takeaways", { placeholder: "title" });
  (x.takeaways || []).forEach((t, i) => {
    const y = 1.85 + i * 0.72;
    node(ctx, s, M, y, i + 1, { size: 0.42, fill: ctx.C.accent2, color: ctx.C.text2 });
    s.addText(t, { x: M + 0.6, y: y - 0.04, w: 4.6, h: 0.55, fontSize: 16, color: ctx.C.background1, valign: "middle", margin: 0, isTextBox: true });
  });
  card(ctx, s, 5.85, 1.85, 3.65, 1.6, ctx.C.accent5, "score card");
  s.addText("SCORE YOURSELF", { x: 6.1, y: 1.97, w: 3.2, h: 0.28, fontSize: 11, bold: true, color: ctx.C.accent2, charSpacing: 1, margin: 0, isTextBox: true });
  const score = x.kind
    ? "Use the rubric (out of " + x.rubric.reduce((n, [, p]) => n + p, 0) + ").\nNote what to improve tomorrow."
    : "Quiz /5 + check task /3 + explain it\nto someone /2 = your score /10.\n8–10 move on · 5–7 re-read · 0–4 get a buddy";
  s.addText(score, { x: 6.1, y: 2.3, w: 3.25, h: 1.05, fontSize: 12, color: ctx.C.background1, valign: "top", margin: 0, isTextBox: true });
  card(ctx, s, 5.85, 3.6, 3.65, 1.15, ctx.C.accent1, "next card");
  s.addText("NEXT UP", { x: 6.1, y: 3.7, w: 3.2, h: 0.28, fontSize: 11, bold: true, color: ctx.C.accent2, charSpacing: 1, margin: 0, isTextBox: true });
  s.addText(next ? `Day ${pad2(next.day)}: ${next.cleanTitle}` : "You've finished the course. Well done!", { x: 6.1, y: 3.98, w: 3.25, h: 0.7, fontSize: 13, bold: true, color: ctx.C.background1, valign: "top", margin: 0, isTextBox: true });
}

const CAPSTONE_DIAGRAM = "                    +--> policy_answer ---------------------------+\nSTART -> classify --+--> portal_agent (tools: projects, employees) --+--> END\n                    +--> extract_leave -> manager_approval (PAUSE) -> notify";

// ---------- course overview deck ----------

function overviewDeck(lessons) {
  const ctx = newDeck({ deckTitle: "LangGraph from Zero: course overview", footer: "LangGraph from Zero · Course overview" });
  const s1 = ctx.pres.addSlide({ masterName: "DARK" });
  s1.addText("SELF-STUDY GUIDE  ·  32 SESSIONS  ·  30 MIN EACH", { placeholder: "kicker" });
  s1.addText("LangGraph from Zero", { placeholder: "title" });
  s1.addText("A day-by-day program for C# developers who are new to AI. You learn by vibe coding and, step by step, rebuild our portal's help-desk chatbot as a real AI agent.", { x: M, y: 2.25, w: 5.2, h: 1.6, fontSize: 17, color: ctx.C.accent6, valign: "top", margin: 0, isTextBox: true });
  [["32", "sessions"], ["16", "hours"], ["4–7", "weeks"]].forEach(([n, l], i) => {
    const x = 6.0 + i * 1.2;
    s1.addText(n, { x, y: 2.2, w: 1.1, h: 0.75, fontSize: 36, bold: true, color: ctx.C.accent2, align: "center", margin: 0, isTextBox: true });
    s1.addText(l, { x, y: 2.95, w: 1.1, h: 0.3, fontSize: 12, color: ctx.C.accent6, align: "center", margin: 0, isTextBox: true });
  });

  const words = [["State", "The folder that moves from desk to desk"], ["Node", "A desk where one job gets done"], ["Edge", "The hallway to the next desk"], ["Conditional edge", "The receptionist choosing the hallway"], ["Tools", "Phone extensions the AI may call"], ["Checkpointer", "Filing cabinet: one drawer per chat"], ["Interrupt", "Manager's in-tray: wait for approval"], ["Store", "Profile card that lasts across chats"]];
  const s2 = contentSlide(ctx, "LangGraph in office words");
  words.forEach(([w, m], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * 4.6;
    const y = 1.2 + row * 0.93;
    card(ctx, s2, x, y, 4.4, 0.8, ctx.C.background2, `word ${w}`);
    node(ctx, s2, x + 0.15, y + 0.19, i + 1, { size: 0.42 });
    s2.addText(w, { x: x + 0.7, y: y + 0.08, w: 3.6, h: 0.3, fontSize: 14, bold: true, color: ctx.C.text2, margin: 0, isTextBox: true });
    s2.addText(m, { x: x + 0.7, y: y + 0.4, w: 3.6, h: 0.3, fontSize: 12, color: ctx.C.text1, margin: 0, isTextBox: true });
  });

  const weeks = [...new Map(lessons.map((l) => [l.week, l])).values()];
  const s3 = contentSlide(ctx, "The route: 7 weeks, 32 sessions");
  weeks.forEach((wk, i) => {
    const days = lessons.filter((l) => l.week === wk.week).map((l) => l.day);
    const y = 1.15 + i * 0.53;
    node(ctx, s3, M, y, wk.week, { size: 0.42 });
    s3.addText(wk.weekTitle, { x: M + 0.6, y: y + 0.04, w: 5.6, h: 0.36, fontSize: 15, bold: true, color: ctx.C.text1, valign: "middle", margin: 0, isTextBox: true });
    s3.addText(`Days ${days[0]}–${days[days.length - 1]}`, { x: 7.0, y: y + 0.04, w: 2.5, h: 0.36, fontSize: 13, color: ctx.C.accent1, align: "right", valign: "middle", margin: 0, isTextBox: true });
  });
  s3.addText("Only 4 weeks? Do two 30-minute sessions on 12 of the 20 days (see 4-week-fast-track.md).", { x: M, y: 4.85, w: 9, h: 0.25, fontSize: 10, italic: true, color: ctx.C.accent4, margin: 0, isTextBox: true });

  const s4 = contentSlide(ctx, "How to use these slides");
  const how = [
    ["Picture + key ideas", "Understand the idea with the office analogy before any code."],
    ["See it in code", "Read the annotated example, then run it and compare the output."],
    ["Build it with AI", "Paste the prompt into your AI assistant, run, ask why, break it."],
    ["Check yourself", "Do the check task, read the common mistakes, take the quiz."],
    ["Wrap-up", "Score yourself /10. Below 5? Re-read before the next day."],
  ];
  how.forEach(([t, d], i) => {
    const y = 1.2 + i * 0.73;
    node(ctx, s4, M, y, i + 1, { size: 0.42 });
    s4.addText(t, { x: M + 0.6, y: y - 0.03, w: 8.4, h: 0.3, fontSize: 15, bold: true, color: ctx.C.text1, margin: 0, isTextBox: true });
    s4.addText(d, { x: M + 0.6, y: y + 0.28, w: 8.4, h: 0.3, fontSize: 13, color: ctx.C.text1, margin: 0, isTextBox: true });
  });

  const s5 = contentSlide(ctx, "One-time setup (Windows)");
  codePanel(ctx, s5, M, 1.15, 5.6, 3.75, EXTRAS[1].code.lines + "\ncopy .env.example .env   # paste your AI key (Day 10+)", "POWERSHELL");
  [["Install first", "Python 3.12+ (tick Add to PATH), VS Code + Python extension, Git, Node.js LTS (Day 18+)."], ["Expected result", "{'name': 'Priya', 'message': 'Hello Priya, welcome to the help desk!'}"], ["Full guide", "learning/langgraph/00-setup-and-cheatsheet.md: setup, C# → Python cheat sheet, vibe-coding rules."]].forEach(([t, d], i) => {
    const y = 1.15 + i * 1.28;
    card(ctx, s5, 6.3, y, 3.2, 1.15, ctx.C.background2, `setup note ${i + 1}`);
    s5.addText(t, { x: 6.5, y: y + 0.1, w: 2.9, h: 0.3, fontSize: 13, bold: true, color: ctx.C.text2, margin: 0, isTextBox: true });
    s5.addText(d, { x: 6.5, y: y + 0.42, w: 2.9, h: 0.68, fontSize: 11, color: ctx.C.text1, valign: "top", margin: 0, isTextBox: true });
  });
  return ctx;
}

// ---------- main ----------

async function write(ctx, fileName) {
  const file = path.join(OUT_DIR, fileName);
  await ctx.pres.writeFile({ fileName: file });
  await applyTheme(file, THEME);
  return file;
}

async function main() {
  const lessons = loadLessons().map((d) => ({ ...d, cleanTitle: stripEmoji(plain(d.title)).replace(/\s*\(scored out of \d+\)/, "") }));
  const only = process.argv[2] ? process.argv[2].split(",").map(Number) : null;
  const written = [];

  if (!only) written.push(await write(overviewDeck(lessons), "day00-course-overview.pptx"));

  for (const [i, d] of lessons.entries()) {
    if (only && !only.includes(d.day)) continue;
    const x = EXTRAS[d.day] || {};
    const ctx = newDeck({ deckTitle: `Day ${pad2(d.day)}: ${d.cleanTitle}`, footer: `LangGraph from Zero · Day ${pad2(d.day)}: ${d.cleanTitle}` });
    titleSlide(ctx, d, x);
    beforeSlide(ctx, d, x);
    if (x.kind) {
      briefSlide(ctx, d, x);
      if (x.concepts) ideasSlides(ctx, x.concepts, "What good looks like");
      stepsSlide(ctx, x);
      buildSlide(ctx, d, x);
      rubricSlide(ctx, x);
    } else {
      pictureSlide(ctx, d);
      ideasSlides(ctx, x.concepts || d.concepts);
      codeSlide(ctx, x);
      runSlide(ctx, d, x);
      buildSlide(ctx, d, x);
      checkSlide(ctx, d, x);
      quizSlides(ctx, d);
    }
    summarySlide(ctx, d, x, lessons[i + 1]);
    written.push(await write(ctx, `day${pad2(d.day)}-${slug(d.cleanTitle)}.pptx`));
  }
  console.log(`Wrote ${written.length} decks to ${OUT_DIR}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
