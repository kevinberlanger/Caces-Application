# Serveur Claude (intermédiaire)
Garde la clé Anthropic hors de l'application (la page et l'APK sont lisibles par tous).

Variables : `ANTHROPIC_API_KEY` (clé), `APP_TOKEN` (secret partagé avec l'application), `ALLOWED_ORIGIN` (adresses autorisées, séparées par des virgules : `https://kevinberlanger.github.io,https://localhost,capacitor://localhost`), `CLAUDE_MODEL` (défaut claude-sonnet-5-5).

Lancer : `node claude-proxy.js` (Node 18+) ou `docker build -t caces-claude . && docker run -p 8787:8787 -e ... caces-claude`.
À héberger en HTTPS (serveur DK, KODO, Render, Fly, Railway…). Dans l'application : bouton « Claude » → Réglages → adresse `https://votre-serveur/api/claude` + jeton.
Limite : 20 demandes par minute et par adresse IP.
