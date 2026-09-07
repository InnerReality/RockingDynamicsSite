import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("./dist", import.meta.url)));
const port = Number(process.env.PORT || 3000);
const types = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, `http://${request.headers.host}`).pathname,
    );
    const aliases = {
      "/validate/playground": "/validate/playground.html",
      "/validate/minaccel": "/validate/minaccel.html",
    };
    const requested =
      aliases[pathname] || (pathname === "/" ? "/index.html" : pathname);
    const file = normalize(resolve(root, `.${requested}`));
    if (!file.startsWith(root) || !existsSync(file)) {
      console.warn(`404 ${pathname} → ${file}`);
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(`Not found: ${pathname}`);
      return;
    }

    const content = await readFile(file);
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
    });
    response.end(content);
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
  }
}).listen(port, () => {
  console.log(`Rocking Dynamics dev server: http://localhost:${port}`);
  console.log(`Serving: ${root}`);
});
