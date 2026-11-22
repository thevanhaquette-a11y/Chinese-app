# 學中文 · Traditional Chinese

Mobile-friendly app to learn Traditional Chinese ⇄ English: vocabulary, grammar, exercises, tests,
a "My mistakes" tab, and **Veronica's vocabulary** — a shared list of words anyone can add.

- `index.html` — the whole app (no build step)
- `server.js` — tiny Node server (no dependencies): serves the page and stores Veronica's list
- Learning progress is saved in each person's browser; Veronica's list is shared through the server.

## Deploy on Railway
1. New Project → Deploy from GitHub repo → pick this repo.
2. In the service: **+ New → Volume**, mount path `/data`.
3. **Variables**: add `DATA_DIR=/data` (without a volume the list is erased on every redeploy).
4. Optional: add `EDIT_CODE=yourcode` — then adding/deleting words asks for this code once per device.
5. Settings → Networking → **Generate Domain**.

## Run locally
```
npm start
```
Then open http://localhost:3000
