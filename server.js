// 學中文 — small server for Railway (no dependencies)
// - serves index.html
// - stores Veronica's vocabulary list in a JSON file
//
// Railway settings:
//   * Add a Volume to the service, mounted at /data
//   * Variable DATA_DIR=/data   (otherwise the list is lost on each redeploy)
//   * Optional variable EDIT_CODE=something  → adding/deleting words then requires this code
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const FILE = path.join(DATA_DIR, "veronica.json");
const EDIT_CODE = process.env.EDIT_CODE || "";
const MAX_ITEMS = 3000;

fs.mkdirSync(DATA_DIR, { recursive: true });
const page = fs.readFileSync(path.join(__dirname, "index.html"));

function load() {
  try { const d = JSON.parse(fs.readFileSync(FILE, "utf8")); return Array.isArray(d) ? d : []; }
  catch { return []; }
}
function store(list) {
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(list, null, 1));
  fs.renameSync(tmp, FILE);
}
function send(res, code, body, type = "application/json; charset=utf-8") {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readBody(req) {
  return new Promise((ok, ko) => {
    let s = "";
    req.on("data", c => { s += c; if (s.length > 10000) { ko(new Error("too big")); req.destroy(); } });
    req.on("end", () => { try { ok(JSON.parse(s || "{}")); } catch (e) { ko(e); } });
  });
}
const clean = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
const allowed = req => !EDIT_CODE || req.headers["x-edit-code"] === EDIT_CODE;

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const p = url.pathname.replace(/\/+$/, "");
  try {
    if (p === "/api/veronica" && req.method === "GET") return send(res, 200, load());
    if (p === "/api/veronica" && req.method === "POST") {
      if (!allowed(req)) return send(res, 401, { error: "edit code required" });
      const b = await readBody(req);
      const zh = clean(b.zh, 60), en = clean(b.en, 200), py = clean(b.py, 120);
      if (!zh || !en) return send(res, 400, { error: "zh and en are required" });
      let list = load().filter(x => x.zh !== zh);
      if (list.length >= MAX_ITEMS) return send(res, 400, { error: "list is full" });
      list.push({ id: crypto.randomBytes(6).toString("hex"), zh, py, en, d: Date.now() });
      store(list);
      return send(res, 200, list);
    }
    if (p.startsWith("/api/veronica/") && req.method === "DELETE") {
      if (!allowed(req)) return send(res, 401, { error: "edit code required" });
      const id = decodeURIComponent(p.slice("/api/veronica/".length));
      const list = load().filter(x => x.id !== id);
      store(list);
      return send(res, 200, list);
    }
    if (p.startsWith("/api/")) return send(res, 404, { error: "not found" });
    return send(res, 200, page, "text/html; charset=utf-8");
  } catch (e) {
    return send(res, 400, { error: "bad request" });
  }
}).listen(PORT, () => console.log("學中文 running on port " + PORT + " — data in " + DATA_DIR));
