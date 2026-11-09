# Serveur Cloudflare du Banc CACES (Worker)

Remplace server/caces-server.js. Mêmes routes : POST /api/inscription (public), GET /api/inscriptions et POST /api/claude (jeton).

## Mise en place depuis le tableau de bord (sans rien installer)
1. dash.cloudflare.com > Workers & Pages > Create > Create Worker > nom : caces-dk > Deploy.
2. Edit code : remplacer tout le contenu par worker.js > Deploy.
3. Storage & Databases > KV > Create : nom FICHES.
4. Worker caces-dk > Settings > Bindings > Add > KV namespace : variable FICHES, namespace FICHES.
5. Settings > Variables and Secrets > Add :
   - APP_TOKEN (Secret) : un mot de passe long
   - ALLOWED_ORIGIN (Text) : https://kevinberlanger.github.io
   - ANTHROPIC_API_KEY (Secret) : facultatif, pour l'assistant Claude
6. L'adresse est https://caces-dk.<votre-compte>.workers.dev : à mettre dans www/config.json (serverUrl).

## Test : https://<adresse>/health doit répondre {"ok":true}
