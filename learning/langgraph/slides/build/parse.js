// Reads ../../week-*.md and returns one object per "## Day N: Title" section.
// The markdown files stay the single source of truth for goals, concepts, prompts and quizzes.
const fs = require("fs");
const path = require("path");

const LESSON_DIR = path.join(__dirname, "..", "..");

function sectionsOf(markdown, week, weekTitle) {
  const days = [];
  const parts = markdown.split(/^## Day (\d+): (.+)$/m);
  for (let i = 1; i < parts.length; i += 3) {
    const body = parts[i + 2].split(/^---$/m)[0];
    days.push({ day: Number(parts[i]), title: parts[i + 1].trim(), week, weekTitle, ...fieldsOf(body), raw: body });
  }
  return days;
}

function codeBlockAfter(text, marker) {
  const at = text.indexOf(marker);
  if (at < 0) return null;
  const match = text.slice(at).match(/```[a-z]*\n([\s\S]*?)```/);
  return match ? match[1].replace(/\s+$/, "") : null;
}

// Text of a "**Label ...**" paragraph up to the next blank line / bold label.
function labelled(text, label) {
  const match = text.match(new RegExp("\\*\\*" + label + "[^*]*\\*\\*:?\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\\*\\*|\\n```|$)"));
  return match ? match[1].replace(/\s*\n\s*/g, " ").trim() : null;
}

// Top-level list items ("- x" or "1. x") between a label and the next bold label / details / code fence.
// Code blocks indented inside an item are kept separately in item.code (shown as code on the slide).
function listAfter(text, label, stopAt = /^\*\*|^<details>|^```|^###|^\|/) {
  const at = text.indexOf(label);
  if (at < 0) return [];
  const lines = text.slice(at).split("\n").slice(1);
  const items = [];
  let fence = null;
  for (const line of lines) {
    if (fence !== null) {
      if (/^\s*```/.test(line)) { items[items.length - 1].code = fence.join("\n"); fence = null; }
      else fence.push(line.replace(/^\s{2}/, ""));
      continue;
    }
    if (items.length && /^\s{2,}```/.test(line)) { fence = []; continue; }
    if (items.length && stopAt.test(line)) break;
    const item = line.match(/^(?:-|\d+\.)\s+(.*)$/);
    if (item) items.push({ text: item[1].trim() });
    else if (/^\s{2,}\S/.test(line) && items.length) items[items.length - 1].text += " " + line.trim();
  }
  return items;
}

function fieldsOf(body) {
  const laymanAt = body.indexOf("**Layman picture");
  const conceptAt = body.indexOf("**Concept");
  let layman = null;
  let diagram = null;
  if (laymanAt >= 0) {
    const between = body.slice(laymanAt, conceptAt > 0 ? conceptAt : undefined).replace(/\*\*Layman picture:\*\*/, "");
    const fence = between.match(/```\n([\s\S]*?)```/);
    if (fence) diagram = fence[1].replace(/\s+$/, "");
    layman = between.replace(/```[\s\S]*?```/g, " ").replace(/\s*\n\s*/g, " ").trim();
  }
  const answersBlock = (body.match(/<details>[\s\S]*?<\/details>/) || [""])[0];
  const compare = (body.match(/Compare with `([^`]+)`/) || [])[1] || null;
  return {
    goal: labelled(body, "Goal"),
    layman,
    diagram,
    concepts: listAfter(body, "**Concept"),
    prompt: codeBlockAfter(body, "**Vibe-code"),
    compare,
    check: labelled(body, "Check task"),
    quiz: listAfter(body, "**Quiz**").map((item) => item.text),
    answers: listAfter(answersBlock, "Answer key").map((item) => item.text),
  };
}

function loadLessons() {
  const files = fs.readdirSync(LESSON_DIR).filter((f) => /^week-\d+-.*\.md$/.test(f)).sort();
  return files.flatMap((file) => {
    const md = fs.readFileSync(path.join(LESSON_DIR, file), "utf8");
    const week = Number(file.match(/^week-(\d+)/)[1]);
    const weekTitle = md.match(/^# Week \d+: ([^(\n]+)/m)[1].trim();
    return sectionsOf(md, week, weekTitle);
  }).sort((a, b) => a.day - b.day);
}

module.exports = { loadLessons };

if (require.main === module) {
  for (const d of loadLessons()) {
    console.log(`Day ${d.day} [w${d.week}] ${d.title} | goal:${!!d.goal} layman:${!!d.layman} diag:${!!d.diagram} concepts:${d.concepts.length} prompt:${!!d.prompt} compare:${d.compare} check:${!!d.check} quiz:${d.quiz.length} ans:${d.answers.length}`);
  }
}
