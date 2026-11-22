// Minimal static server for Railway (no dependencies)
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 3000;
const page = fs.readFileSync(path.join(__dirname, "index.html"));
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
  res.end(page);
}).listen(PORT, () => console.log("學中文 running on port " + PORT));
