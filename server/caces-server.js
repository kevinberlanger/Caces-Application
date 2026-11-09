// Serveur DK / KODO du Banc d'évaluation CACES : reçoit les fiches d'inscription (avec photo),
// les met à disposition de l'application, et relaie l'assistant Claude. Aucune dépendance (Node 18+).
// Démarrage : APP_TOKEN=secret ALLOWED_ORIGIN=https://kevinberlanger.github.io DATA_DIR=./data node caces-server.js
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const TOKEN = process.env.APP_TOKEN, KEY = process.env.ANTHROPIC_API_KEY;
const ORIGINS = (process.env.ALLOWED_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
const DATA = path.resolve(process.env.DATA_DIR || "./data"), FICHES = path.join(DATA, "fiches");
const PORT = process.env.PORT || 8787, MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5", BASE = process.env.ANTHROPIC_BASE || "https://api.anthropic.com";
if (!TOKEN) { console.error("APP_TOKEN est obligatoire."); process.exit(1); }
fs.mkdirSync(FICHES, { recursive: true });
const SYSTEM = `Tu es l'assistant du Banc d'évaluation CACES / ACES de DK Group, au service des formateurs, testeurs et du secrétariat.
Réponds en français, de façon directe et précise, sans flatterie. Si tu ne sais pas, dis-le.
Règles métier : réussite CACES® = au moins 70/100 en théorie et au moins la moyenne dans chaque thème, aucun point pratique à 0 ; CACES® = test par un organisme certifié, ACES = autorisation de conduite de l'employeur ; le formateur ne peut pas être le testeur pour un CACES®.
Tu proposes, tu ne décides pas. N'invente aucune donnée absente du contexte fourni.`;
const RECOS = ["R485", "R486", "R489", "TP"], LEN = { c: 12, r: 4, n: 80, p: 80, d: 10, e: 120, t: 30, en: 120, po: 80, ca: 120, nv: 12, xp: 40, cd: 200, am: 8, ad: 8, pf: 20, ts: 40 };
// Ne garde que les champs attendus, avec leur type et une taille maximale (la fiche vient d'un formulaire public).
const clean = o => {
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const c = {};
  for (const k of Object.keys(LEN)) if (typeof o[k] === "string") c[k] = o[k].slice(0, LEN[k]);
  if (Array.isArray(o.ch)) c.ch = o.ch.filter(x => typeof x === "string").slice(0, 10).map(x => x.slice(0, 60));
  if (o.emp && typeof o.emp === "object" && !Array.isArray(o.emp)) { c.emp = {}; for (const k of Object.keys(o.emp).slice(0, 12)) if (typeof o.emp[k] === "string") c.emp[k] = o.emp[k].slice(0, 200); }
  if (typeof o.phw === "number" && isFinite(o.phw)) c.phw = o.phw;
  if (typeof o.ph === "string" && /^data:image\/(jpeg|png);base64,[A-Za-z0-9+\/=]+$/.test(o.ph) && o.ph.length <= 500000) c.ph = o.ph;
  if (c.r && !RECOS.includes(c.r)) delete c.r;
  if (c.d && !/^\d{4}-\d{2}-\d{2}$/.test(c.d)) delete c.d;
  return c;
};
const hits = new Map();
const limited = (ip, max) => { const now = Date.now(), h = (hits.get(ip) || []).filter(t => now - t < 60000); if (h.length >= max) return true; h.push(now); hits.set(ip, h); return false; };
const cors = (req, res) => { const o = req.headers.origin; if (o && (ORIGINS.includes("*") || ORIGINS.includes(o))) { res.setHeader("Access-Control-Allow-Origin", o); res.setHeader("Vary", "Origin"); }
  res.setHeader("Access-Control-Allow-Headers", "authorization,content-type"); res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS"); };
const readBody = async (req, max) => { let b = ""; for await (const c of req) { b += c; if (b.length > max) throw new Error("trop long"); } return b; };
const mail = x => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x || "");
http.createServer(async (req, res) => {
  cors(req, res);
  const send = (c, o) => { res.writeHead(c, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, "http://x"), ip = req.socket.remoteAddress, staff = (req.headers.authorization || "") === "Bearer " + TOKEN;
  try {
    if (req.method === "GET" && url.pathname === "/health") return send(200, { ok: true });
    // Dépôt d'une fiche par le stagiaire (public, limité)
    if (req.method === "POST" && url.pathname === "/api/inscription") {
      if (limited(ip, 30)) return send(429, { error: "trop de demandes" });
      let o; try { o = JSON.parse(await readBody(req, 700000)); } catch (e) { return send(400, { error: "fiche illisible" }); }
      o = clean(o);
      if (!o || !o.n || !o.p || !mail(o.e) || !o.d) return send(400, { error: "fiche incomplète" });
      const id = crypto.createHash("sha1").update((o.e || "").toLowerCase() + "|" + (o.r || "")).digest("hex").slice(0, 16);
      o.receivedAt = new Date().toISOString();
      fs.writeFileSync(path.join(FICHES, id + ".json"), JSON.stringify(o));
      return send(200, { ok: true, id });
    }
    // Lecture par l'application (personnel)
    if (req.method === "GET" && url.pathname === "/api/inscriptions") {
      if (!staff) return send(401, { error: "jeton invalide" });
      const since = url.searchParams.get("since") || "";
      const list = fs.readdirSync(FICHES).filter(f => f.endsWith(".json")).map(f => { try { return JSON.parse(fs.readFileSync(path.join(FICHES, f), "utf8")); } catch (e) { return null; } })
        .filter(x => x && (x.receivedAt || "") > since).sort((a, b) => (a.receivedAt || "").localeCompare(b.receivedAt || ""));
      return send(200, { fiches: list });
    }
    // Assistant Claude (personnel)
    if (req.method === "POST" && url.pathname === "/api/claude") {
      if (!staff) return send(401, { error: "jeton invalide" });
      if (!KEY) return send(503, { error: "assistant non configuré (ANTHROPIC_API_KEY)" });
      if (limited(ip, 20)) return send(429, { error: "trop de demandes, réessayez dans une minute" });
      let j; try { j = JSON.parse(await readBody(req, 300000)); } catch (e) { return send(400, { error: "JSON invalide" }); }
      const msgs = (j.messages || []).filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-20);
      if (!msgs.length || msgs[msgs.length - 1].role !== "user") return send(400, { error: "message manquant" });
      const system = SYSTEM + (j.context ? "\n\nContexte fourni par l'application :\n" + String(j.context).slice(0, 20000) : "");
      const r = await fetch(BASE + "/v1/messages", { method: "POST", headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify({ model: MODEL, max_tokens: 1500, system, messages: msgs }) });
      const d = await r.json();
      if (!r.ok) return send(502, { error: (d.error && d.error.message) || "erreur Anthropic" });
      return send(200, { text: (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n") });
    }
    send(404, { error: "introuvable" });
  } catch (e) { send(500, { error: "erreur serveur" }); }
}).listen(PORT, () => console.log("Serveur CACES sur le port " + PORT + " — données : " + DATA));
