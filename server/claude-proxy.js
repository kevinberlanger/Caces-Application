// Serveur intermédiaire : garde la clé Anthropic hors de l'application.
// Démarrage : ANTHROPIC_API_KEY=sk-... APP_TOKEN=un-secret ALLOWED_ORIGIN=https://kevinberlanger.github.io node server/claude-proxy.js
const http = require("http");
const KEY = process.env.ANTHROPIC_API_KEY, TOKEN = process.env.APP_TOKEN;
const ORIGINS = (process.env.ALLOWED_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
const BASE = process.env.ANTHROPIC_BASE || "https://api.anthropic.com";
const PORT = process.env.PORT || 8787;
if (!KEY || !TOKEN) { console.error("ANTHROPIC_API_KEY et APP_TOKEN sont obligatoires."); process.exit(1); }
const SYSTEM = `Tu es l'assistant du Banc d'évaluation CACES / ACES de DK Group, au service des formateurs, testeurs et du secrétariat.
Réponds en français, de façon directe et précise, sans flatterie. Si tu ne sais pas, dis-le.
Règles métier : réussite CACES® = au moins 70/100 en théorie et au moins la moyenne dans chaque thème, aucun point pratique à 0 ; CACES® = test par un organisme certifié, ACES = autorisation de conduite de l'employeur (aptitude médicale, contrôle des connaissances et savoir-faire, connaissance des lieux) ; le formateur ne peut pas être le testeur pour un CACES®.
Tu proposes, tu ne décides pas : la décision finale appartient au testeur. N'invente aucune donnée absente du contexte fourni.`;
const hits = new Map();
function cors(req, res) {
  const o = req.headers.origin;
  if (o && (ORIGINS.includes("*") || ORIGINS.includes(o))) { res.setHeader("Access-Control-Allow-Origin", o); res.setHeader("Vary", "Origin"); }
  res.setHeader("Access-Control-Allow-Headers", "authorization,content-type"); res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
}
http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  if (req.method === "GET" && req.url === "/health") { res.writeHead(200); return res.end("ok"); }
  const send = (c, o) => { res.writeHead(c, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.method !== "POST" || req.url !== "/api/claude") return send(404, { error: "introuvable" });
  if ((req.headers.authorization || "") !== "Bearer " + TOKEN) return send(401, { error: "jeton invalide" });
  const ip = req.socket.remoteAddress, now = Date.now(), h = (hits.get(ip) || []).filter(t => now - t < 60000);
  if (h.length >= 20) return send(429, { error: "trop de demandes, réessayez dans une minute" }); h.push(now); hits.set(ip, h);
  let body = ""; for await (const c of req) { body += c; if (body.length > 300000) return send(413, { error: "message trop long" }); }
  let j; try { j = JSON.parse(body); } catch (e) { return send(400, { error: "JSON invalide" }); }
  const msgs = (j.messages || []).filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-20);
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return send(400, { error: "message manquant" });
  const system = SYSTEM + (j.context ? "\n\nContexte fourni par l'application :\n" + String(j.context).slice(0, 20000) : "");
  try {
    const r = await fetch(BASE + "/v1/messages", { method: "POST", headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify({ model: MODEL, max_tokens: 1500, system, messages: msgs }) });
    const d = await r.json();
    if (!r.ok) return send(502, { error: (d.error && d.error.message) || "erreur Anthropic" });
    send(200, { text: (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n") });
  } catch (e) { send(502, { error: "Anthropic injoignable" }); }
}).listen(PORT, () => console.log("Serveur Claude sur le port " + PORT));
