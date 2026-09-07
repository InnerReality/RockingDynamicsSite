// Build the playground + markdown docs.
//
//   - index.html and assets are copied to dist/.
//   - validate/ runtime files are copied to dist/validate/.
//   - docs/*.md are converted to dist/docs/*.html with KaTeX (math) and
//     Mermaid (diagrams) support.
//   - docs/playground-content.md is injected below the playground layout.
//
// Requires: npm install (marked + katex are devDependencies).
import {
  cpSync,
  rmSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, basename } from "node:path";
import { marked } from "marked";
import katex from "katex";

const root = fileURLToPath(new URL(".", import.meta.url));
const dist = resolve(root, "dist");
const out = resolve(dist, "validate");
const docsDir = resolve(root, "docs");

const KATEX_CSS =
  "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
const MERMAID_JS =
  "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js";

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
    katex.renderToString(m.trim(), { displayMode: true, throwOnError: false }),
  );
  text = text.replace(/\$([^$\n]+?)\$/g, (_, m) =>
    katex.renderToString(m.trim(), { throwOnError: false }),
  );
  text = text.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => blocks[+i]);
  return text;
}

// Mermaid fenced blocks (```mermaid) become <pre class="mermaid">, rendered
// by the mermaid script at runtime.
marked.use({
  renderer: {
    // marked >=5 passes a token object; older builds pass (code, lang, ...).
    // Handle both, and HTML-escape the source so <br/> etc. survive in the
    // DOM as text (mermaid reads innerHTML and entity-decodes it back).
    code(codeOrToken, langArg) {
      const text =
        typeof codeOrToken === "string" ? codeOrToken : codeOrToken.text;
      const lang = typeof codeOrToken === "string" ? langArg : codeOrToken.lang;
      if (lang === "mermaid") {
        const esc = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `<pre class="mermaid">\n${esc}\n</pre>`;
      }
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

function mdToHtml(md, title) {
  const body = marked.parse(renderMath(md));
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
cpSync(resolve(root, "index.html"), resolve(dist, "index.html"));
cpSync(resolve(root, "theme.js"), resolve(dist, "theme.js"));
cpSync(resolve(root, "assets"), resolve(dist, "assets"), { recursive: true });
cpSync(resolve(root, "robots.txt"), resolve(dist, "robots.txt"));
cpSync(resolve(root, "sitemap.xml"), resolve(dist, "sitemap.xml"));
cpSync(resolve(root, "css"), resolve(dist, "css"), { recursive: true });
cpSync(resolve(root, "chapters"), resolve(dist, "chapters"), {
  recursive: true,
});
cpSync(resolve(root, "chapter.js"), resolve(dist, "chapter.js"));

// 1. Assemble the JS bundles from the solver source + wiring files
//    (mirrors the manual recipe in the wiring headers).
const bundles = [
  ["playground-app.js", "playground-wiring.js"],
  ["playground-worker.js", "worker-wiring.js"],
  ["minaccel-worker.js", "minaccel-worker-wiring.js"],
];
const timing = readFileSync(
  resolve(root, "validate/simulator-timing.js"),
  "utf8",
);
const plotUtils = readFileSync(
  resolve(root, "validate/simulator-plot-utils.js"),
  "utf8",
);
for (const [fname, wiring] of bundles) {
  const solver = readFileSync(resolve(root, "validate/animate-app.js"), "utf8");
  const marker = "// validate/animate-src.ts";
  const idx = solver.indexOf(marker);
  if (idx < 0)
    throw new Error(`marker not found in animate-app.js (for ${fname})`);
  const w = readFileSync(resolve(root, `validate/${wiring}`), "utf8");
  writeFileSync(
    resolve(out, fname),
    timing + "\n" + plotUtils + "\n" + solver.slice(0, idx) + w,
  );
}

// 2. validate/ static runtime files
for (const f of [
  "playground.html",
  "eq-data.js",
  "minaccel.html",
  "minaccel-app.js",
  "simulator-timing.js",
  "simulator-plot-utils.js",
  "capture-gif.js",
  "simulator-common.css",
  "smoothstep.html",
  "smoothstep.js",
]) {
  cpSync(resolve(root, `validate/${f}`), resolve(out, f));
}
// minaccel.html fetches minaccel-content.md at runtime
cpSync(
  resolve(docsDir, "minaccel-content.md"),
  resolve(out, "minaccel-content.md"),
);

// 2. docs/*.md → dist/docs/*.html
//    Placeholders like {{a}} in minaccel-content.md are substituted with the
//    default body values for the static docs page (the live page substitutes
//    the current slider values in the browser).
const MD_DEFAULTS = {
  P: 306,
  W: 1000,
  r0: 12,
  h: 40,
  a: 1.4,
  eq: "a = g\\,\\frac{(1 + 12\\,P/W)\\,r_0}{h} = 1.4\\,g",
  defs:
    "where $P = 306$ lb is the Belleville-washer preload per stack, $W = 1000$ lb " +
    "is the body weight, $r_0 = 12$ in is the pivot radius, and $h = h_{CM} = 40$ in " +
    "is the center-of-mass height. With the current body parameters the rocking onset " +
    "is at $a = 1.4\\,g$. When the BW force is disabled, the preload term drops out " +
    "($P = 0$) and the equation reduces to $a = g\\,r_0/h$.",
};
function substituteDefaults(md) {
  let out = md;
  for (const [k, v] of Object.entries(MD_DEFAULTS)) {
    out = out.replaceAll(`{{${k}}}`, String(v));
  }
  return out;
}
if (existsSync(docsDir)) {
  mkdirSync(resolve(dist, "docs"), { recursive: true });
  for (const f of readdirSync(docsDir).filter((f) => f.endsWith(".md"))) {
    const name = basename(f, ".md");
    const title = name
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const md = substituteDefaults(readFileSync(resolve(docsDir, f), "utf8"));
    writeFileSync(resolve(dist, "docs", `${name}.html`), mdToHtml(md, title));
  }
}

// 3. Inject Markdown content into interactive pages.
//    (minaccel.html embeds its markdown directly and renders it client-side,
//    so it is not injected here.)
const MD_STYLE_INJECT = `<style>
.md-content { max-width: 960px; margin: 24px auto; padding: 0 20px 40px; line-height: 1.6; }
.md-content h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
.md-content code { background: #f0f0f0; padding: 1px 5px; border-radius: 3px; }
.md-content pre { background: #f6f8fa; padding: 12px; border-radius: 6px; overflow-x: auto; }
.md-content pre.mermaid { background: #fff; text-align: center; }
.md-content table { border-collapse: collapse; }
.md-content th, .md-content td { border: 1px solid #ddd; padding: 6px 10px; }
.md-content img { max-width: 100%; }
</style>`;
const smoothstepMd = resolve(docsDir, "smoothstep-derivation.md");
if (existsSync(smoothstepMd)) {
  const html = readFileSync(resolve(out, "smoothstep.html"), "utf8");
  const contentHtml = marked.parse(
    renderMath(readFileSync(smoothstepMd, "utf8")),
  );
  const smoothstepStyle = `<style>
.smoothstep-md { max-width: 960px; margin: 24px auto; padding: 0 20px 40px; line-height: 1.6; }
.smoothstep-md h2 { border-bottom: 1px solid var(--border); padding-bottom: 6px; }
.smoothstep-md .katex-display { overflow-x: auto; overflow-y: hidden; }
</style>`;
  const injected = html
    .replace(
      "</head>",
      `${smoothstepStyle}<link rel="stylesheet" href="${KATEX_CSS}">\n</head>`,
    )
    .replace(
      "</body>",
      `<section class="smoothstep-md">\n${contentHtml}\n</section>\n</body>`,
    );
  writeFileSync(resolve(out, "smoothstep.html"), injected);
}

const contentMd = resolve(docsDir, "playground-content.md");
if (existsSync(contentMd)) {
  const html = readFileSync(resolve(out, "playground.html"), "utf8");
  const contentHtml = marked.parse(renderMath(readFileSync(contentMd, "utf8")));
  const injected = html
    .replace(
      "</head>",
      `${MD_STYLE_INJECT}<link rel="stylesheet" href="${KATEX_CSS}">\n</head>`,
    )
    .replace(
      "</body>",
      `<section class="md-content">\n${contentHtml}\n</section>\n<script src="${MERMAID_JS}"></script>\n<script>mermaid.initialize({ startOnLoad: true });</script>\n</body>`,
    );
  writeFileSync(resolve(out, "playground.html"), injected);
}

console.log("Built playground + docs into dist/");
