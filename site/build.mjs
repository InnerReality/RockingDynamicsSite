// Build the playground + markdown docs.
//
//   - validate/ runtime files are copied to dist/validate/.
//   - docs/*.md are converted to dist/docs/*.html with KaTeX (math) and
//     Mermaid (diagrams) support.
//   - docs/playground-content.md is injected below the playground layout.
//
// Requires: npm install (marked + katex are devDependencies).
import {
  cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, basename } from "node:path";
import { marked } from "marked";
import katex from "katex";

const root = fileURLToPath(new URL(".", import.meta.url));
const dist = resolve(root, "dist");
const out = resolve(dist, "validate");
const docsDir = resolve(root, "docs");

const KATEX_CSS = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
const MERMAID_JS = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js";

// --- markdown → html with KaTeX + Mermaid ---

// Render $...$ / $$...$$ math with KaTeX (server-side). Fenced code blocks
// are protected first so $ inside code is untouched.
function renderMath(text) {
  const blocks = [];
  text = text.replace(/```[\s\S]*?```/g, (m) => {
    blocks.push(m);
    return `\u0000CODE${blocks.length - 1}\u0000`;
  });
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) =>
    katex.renderToString(m.trim(), { displayMode: true, throwOnError: false }));
  text = text.replace(/\$([^$\n]+?)\$/g, (_, m) =>
    katex.renderToString(m.trim(), { throwOnError: false }));
  text = text.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => blocks[+i]);
  return text;
}

// Mermaid fenced blocks (```mermaid) become <pre class="mermaid">, rendered
// by the mermaid script at runtime.
marked.use({
  renderer: {
    code({ text, lang }) {
      if (lang === "mermaid") return `<pre class="mermaid">\n${text}\n</pre>`;
      return false; // default handling
    },
  },
});

const MD_STYLE = `
  body { font-family: "Segoe UI", sans-serif; margin: 0; background: #fafafa; color: #111; line-height: 1.6; }
  main { max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem 4rem; background: #fff; min-height: 100vh; }
  h1, h2, h3 { line-height: 1.3; }
  code { background: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 0.9em; }
  pre { background: #f6f8fa; padding: 12px; border-radius: 6px; overflow-x: auto; }
  pre.mermaid { background: #fff; text-align: center; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid #ddd; padding: 6px 10px; }
  a { color: #2563eb; }
`;

function mdToHtml(mdPath, title) {
  const body = marked.parse(renderMath(readFileSync(mdPath, "utf8")));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="${KATEX_CSS}">
<style>${MD_STYLE}</style>
</head>
<body>
<main>
${body}
</main>
<script src="${MERMAID_JS}"></script>
<script>mermaid.initialize({ startOnLoad: true });</script>
</body>
</html>`;
}

// --- build ---
rmSync(dist, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// 1. validate/ runtime files
for (const f of ["playground.html", "playground-app.js", "playground-worker.js", "eq-data.js"]) {
  cpSync(resolve(root, `validate/${f}`), resolve(out, f));
}

// 2. docs/*.md → dist/docs/*.html
if (existsSync(docsDir)) {
  mkdirSync(resolve(dist, "docs"), { recursive: true });
  for (const f of readdirSync(docsDir).filter((f) => f.endsWith(".md"))) {
    const name = basename(f, ".md");
    const title = name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    writeFileSync(resolve(dist, "docs", `${name}.html`), mdToHtml(resolve(docsDir, f), title));
  }
}

// 3. docs/playground-content.md → injected below the playground layout
const contentMd = resolve(docsDir, "playground-content.md");
if (existsSync(contentMd)) {
  const html = readFileSync(resolve(out, "playground.html"), "utf8");
  const contentHtml = marked.parse(renderMath(readFileSync(contentMd, "utf8")));
  const style = `<style>
.md-content { max-width: 960px; margin: 24px auto; padding: 0 20px 40px; line-height: 1.6; }
.md-content h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
.md-content code { background: #f0f0f0; padding: 1px 5px; border-radius: 3px; }
.md-content pre { background: #f6f8fa; padding: 12px; border-radius: 6px; overflow-x: auto; }
.md-content pre.mermaid { background: #fff; text-align: center; }
.md-content table { border-collapse: collapse; }
.md-content th, .md-content td { border: 1px solid #ddd; padding: 6px 10px; }
.md-content img { max-width: 100%; }
</style>`;
  const injected = html
    .replace("</head>", `${style}<link rel="stylesheet" href="${KATEX_CSS}">\n</head>`)
    .replace("</body>", `<section class="md-content">\n${contentHtml}\n</section>\n<script src="${MERMAID_JS}"></script>\n<script>mermaid.initialize({ startOnLoad: true });</script>\n</body>`);
  writeFileSync(resolve(out, "playground.html"), injected);
}

console.log("Built playground + docs into dist/");