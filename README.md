# Banc d'évaluation CACES / ACES — DK Group

Application HTML autonome (un seul fichier `www/index.html`) pour former, évaluer et autoriser des conducteurs : chariots R.489, gerbeurs R.485, PEMP R.486, transpalettes. CACES® (organisme testeur) et ACES (autorisation de conduite employeur).

## Contenu
- `www/index.html` : l'application (v51)
- `referentiels/` : PDF d'évaluation théorique R.485, R.486, R.489
- `docs/` : notes de conception (structure, connexions, cahier des charges)
- `src-modules/` : modules JS et scripts de patch ayant servi à assembler la page
- `tests/` : simulation (mock) et test de parcours Playwright
- `capacitor.config.json`, `package.json` : emballage en APK Android

## Dépendances à remplacer hors claude.ai
La page a été conçue pour tourner dans claude.ai avec un runtime `window.claude` :
| Besoin | Dans claude.ai | À prévoir dans l'APK |
|---|---|---|
| Base partagée | `claude.use("db")` | API serveur DK / KODO (la couche hors connexion IndexedDB + file d'envoi existe déjà) |
| Mail | `claude.use("mcp")` Gmail | SMTP / Gmail API / Microsoft 365 |
| Identité | `claude.use("user")` | connexion par mail (SSO) |
| Téléchargements | `claude.use("downloads")` | plugin Capacitor Filesystem / Share |
| Drive | non déclaré | Google Drive API (dossier « Sessions ») |
Sans `window.claude`, la page retombe sur le stockage local de l'appareil.

## Construire l'APK
```
npm install
npx cap add android
npm run apk      # APK dans android/app/build/outputs/apk/debug
```
Prérequis : Node 18+, JDK 17, Android SDK.

## Points ouverts
Voir `docs/`. Envois Gmail/Drive jamais testés en réel (seulement en simulation) ; logos réels DT Signs et DK Printing à intégrer ; fiche de transmission à l'organisme testeur et alerte à 12 mois non faites.

## Mise à jour automatique (PC + tablette)
- **PC** : GitHub Pages publie `www/` à chaque push sur `main` (Settings → Pages → Source : GitHub Actions). L'adresse est `https://<organisation>.github.io/<depot>/`. La page est installable (PWA) et se met à jour à l'ouverture.
- **APK** : l'action « APK Android » le recompile à chaque push et le dépose dans Releases → « Dernière version ». Pour que l'APK charge toujours le site en ligne, créer la variable de dépôt `SITE_URL` (Settings → Variables) avec l'adresse Pages ; sinon l'application embarquée est utilisée.
- Les données (candidats, résultats) ne se synchronisent pas encore entre appareils : brancher l'API KODO ou un serveur DK.

## Assistant Claude
Bouton « ✨ Claude » (en bas à droite) : questions sur les référentiels, aide à la rédaction, relecture du dossier sélectionné (option « Joindre le dossier », sans nom ni mail).
Il passe par un petit serveur qui garde la clé Anthropic : voir `server/README.md`. Réglages (adresse + jeton) dans le ⚙ du panneau, stockés uniquement sur l'appareil.
