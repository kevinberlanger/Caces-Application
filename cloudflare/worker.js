// Worker Cloudflare du Banc d'évaluation CACES : reçoit les fiches d'inscription (avec photo),
// les met à disposition de l'application, relaie l'assistant Claude.
// Variables : APP_TOKEN (secret), ALLOWED_ORIGIN, ANTHROPIC_API_KEY (secret, facultatif), CLAUDE_MODEL (facultatif)
// Stockage : KV "FICHES" (une clé f:<id> par fiche).
const SYSTEM = `Tu es l'assistant du Banc d'évaluation CACES / ACES de DK Group, au service des formateurs, testeurs et du secrétariat.
Réponds en français, de façon directe et précise, sans flatterie. Si tu ne sais pas, dis-le.
Règles métier : réussite CACES® = au moins 70/100 en théorie et au moins la moyenne dans chaque thème, aucun point pratique à 0 ; CACES® = test par un organisme certifié, ACES = autorisation de conduite de l'employeur ; le formateur ne peut pas être le testeur pour un CACES®.
Tu proposes, tu ne décides pas. N'invente aucune donnée absente du contexte fourni.`;
// Si les variables Cloudflare sont introuvables, on utilise ces valeurs.
// JETON : remplacez le texte entre guillemets par votre mot de passe, DIRECTEMENT dans l'éditeur Cloudflare (jamais dans GitHub).
const JETON = "REMPLACER_PAR_VOTRE_JETON";
const ORIGINE = "https://kevinberlanger.github.io";
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
const mail = x => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x || "");
const sha1 = async s => [...new Uint8Array(await crypto.subtle.digest("SHA-1", new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
const safeEq = (a, b) => { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };

export default {
  async fetch(req, env) {
    const origins = (env.ALLOWED_ORIGIN || ORIGINE).split(",").map(s => s.trim()).filter(Boolean);
    const origin = req.headers.get("origin");
    const originOk = !origin || origins.includes("*") || origins.includes(origin);
    const h = { "content-type": "application/json", "access-control-allow-headers": "authorization,content-type", "access-control-allow-methods": "GET,POST,OPTIONS" };
    if (origin && originOk) { h["access-control-allow-origin"] = origin; h["vary"] = "Origin"; }
    const send = (c, o) => new Response(c === 204 ? null : JSON.stringify(o), { status: c, headers: h });
    if (req.method === "OPTIONS") return send(204);
    if (!originOk) return send(403, { error: "origine non autorisée" });
    const url = new URL(req.url), ip = req.headers.get("cf-connecting-ip") || "x";
    const tok = env.APP_TOKEN || JETON;
    const staff = tok !== "REMPLACER_PAR_VOTRE_JETON" && tok.length >= 12 && safeEq(req.headers.get("authorization") || "", "Bearer " + tok);
    try {
      if (req.method === "GET" && url.pathname === "/health") return send(200, { ok: true });
      if (req.method === "POST" && url.pathname === "/api/inscription") {
        if (limited(ip, 30)) return send(429, { error: "trop de demandes" });
        const raw = await req.text();
        if (raw.length > 700000) return send(413, { error: "fiche trop lourde" });
        let o; try { o = JSON.parse(raw); } catch (e) { return send(400, { error: "fiche illisible" }); }
        o = clean(o);
        if (!o || !o.n || !o.p || !mail(o.e) || !o.d) return send(400, { error: "fiche incomplète" });
        const id = await sha1((o.e || "").toLowerCase() + "|" + (o.r || ""));
        o.receivedAt = new Date().toISOString();
        await env.FICHES.put("f:" + id, JSON.stringify(o));
        return send(200, { ok: true, id });
      }
      if (req.method === "GET" && url.pathname === "/api/inscriptions") {
        if (!staff) return send(401, { error: "jeton invalide" });
        const since = url.searchParams.get("since") || "";
        const out = []; let cursor;
        do {
          const l = await env.FICHES.list({ prefix: "f:", cursor });
          const vals = await Promise.all(l.keys.map(k => env.FICHES.get(k.name, "json")));
          vals.forEach(x => { if (x && (x.receivedAt || "") > since) out.push(x); });
          cursor = l.list_complete ? null : l.cursor;
        } while (cursor);
        out.sort((a, b) => (a.receivedAt || "").localeCompare(b.receivedAt || ""));
        return send(200, { fiches: out });
      }
      if (req.method === "POST" && url.pathname === "/api/claude") {
        if (!staff) return send(401, { error: "jeton invalide" });
        if (!env.ANTHROPIC_API_KEY) return send(503, { error: "assistant non configuré (ANTHROPIC_API_KEY)" });
        if (limited(ip, 20)) return send(429, { error: "trop de demandes, réessayez dans une minute" });
        const raw = await req.text();
        if (raw.length > 300000) return send(413, { error: "trop long" });
        let j; try { j = JSON.parse(raw); } catch (e) { return send(400, { error: "JSON invalide" }); }
        const msgs = (j.messages || []).filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-20);
        if (!msgs.length || msgs[msgs.length - 1].role !== "user") return send(400, { error: "message manquant" });
        const system = SYSTEM + (j.context ? "\n\nContexte fourni par l'application :\n" + String(j.context).slice(0, 20000) : "");
        const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify({ model: env.CLAUDE_MODEL || "claude-sonnet-5-5", max_tokens: 1500, system, messages: msgs }) });
        const d = await r.json();
        if (!r.ok) return send(502, { error: (d.error && d.error.message) || "erreur Anthropic" });
        return send(200, { text: (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n") });
      }
      return send(404, { error: "introuvable" });
    } catch (e) { return send(500, { error: "erreur serveur" }); }
  }
};
