# Serveur DK / KODO du Banc CACES
Reçoit les fiches d'inscription (avec photo) envoyées par les stagiaires depuis leur téléphone, les donne à l'application, et relaie l'assistant Claude. Aucune dépendance : Node 18+ ou Docker.

## Variables
- `APP_TOKEN` (obligatoire) : mot de passe du personnel (à saisir dans l'application).
- `ALLOWED_ORIGIN` : adresses autorisées, séparées par des virgules, ex. `https://kevinberlanger.github.io,https://localhost`.
- `DATA_DIR` : dossier des données (défaut `./data`, `/data` dans Docker). **À sauvegarder** : il contient les fiches et les photos (données personnelles, RGPD).
- `ANTHROPIC_API_KEY` (facultatif) : active l'assistant Claude. `CLAUDE_MODEL` (défaut claude-sonnet-5-5).

## Lancer
`node caces-server.js` ou `docker build -t caces-server . && docker run -p 8787:8787 -v caces-data:/data -e APP_TOKEN=... -e ALLOWED_ORIGIN=... caces-server`
À placer derrière HTTPS (reverse proxy du serveur DK, ou hébergeur).

## Routes
- `POST /api/inscription` (public, 30/min/IP) : fiche du stagiaire (+ photo). Une fiche par adresse mail et formation.
- `GET /api/inscriptions?since=ISO` (jeton) : fiches reçues depuis une date.
- `POST /api/claude` (jeton) : assistant.
- `GET /health`.

## Brancher l'application
Dans `www/config.json`, renseigner `{"serverUrl":"https://adresse-du-serveur"}`. Dans l'application, onglet Inscriptions, saisir le jeton (une fois par appareil).
