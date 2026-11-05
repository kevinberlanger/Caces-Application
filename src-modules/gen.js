/* =========================================================================
   STRUCTURE GÉNÉRIQUE · FICHE TÉLÉCHARGEABLE · TOUS LES DOCUMENTS · CONNEXIONS
   ========================================================================= */
/* ---------- structure (entreprise, centre de formation, ou les deux) ---------- */
const STRTYPES=[["entreprise","Entreprise (ACES)"],["centre","Centre de formation (CACES®)"],["mixte","Les deux"]];
const strNom=()=>String(S.centre.nom||"").trim();
const strOrg=()=>String(S.centre.organisme||"").trim();
const strType=()=>S.centre.type||"mixte";
function strTo(){const n=strNom();if(n)return "à "+n;return strType()==="centre"?"au centre de formation":strType()==="entreprise"?"à l'entreprise":"à la structure organisatrice";}
function strWho(){const n=strNom();return n||(strType()==="centre"?"le centre de formation":strType()==="entreprise"?"l'entreprise":"la structure organisatrice");}
function consentText(){const org=strOrg();
  return `J'accepte que ces informations et ma photo soient utilisées par ${strWho()} pour organiser ma formation et mon évaluation, et pour établir mon autorisation de conduite${org?" ou mon CACES®, et qu'elles soient transmises à "+org+" à cette seule fin":" ou, le cas échéant, mon CACES®"}.`;}
/* entités employeurs : une par ligne, « Nom | SIRET | Adresse | Signataire » (seul le nom est obligatoire) */
const entList=()=>(S.centre.entites||[]).map(l=>{const p=String(l).split("|").map(x=>x.trim());return {nom:p[0]||"",siret:p[1]||"",adr:p[2]||"",sg:p[3]||""};}).filter(x=>x.nom);
const entFind=n=>entList().find(x=>x.nom.toLowerCase()===String(n||"").trim().toLowerCase())||null;
const sessNum=c=>{const a=arrOf(c);return c&&a?`${c.reco}-${a.replace(/-/g,"")}`:"";};
const slug=s=>String(s||"x").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"").toLowerCase()||"x";
const candSlug=c=>slug((c.nom||"")+"-"+(c.prenom||""))+"-"+(c.code||"").toLowerCase();

/* ---------- fiche de renseignements (vierge ou pré-remplie), prête à imprimer ou à enregistrer en PDF ---------- */
function ficheHtml(c,recoKey){
  const reco=c?c.reco:(RECOS[recoKey]?recoKey:"R489"),rc=RECOS[reco],i=(c&&c.insc)||{},emp=i.employeur||entFind(c&&c.entreprise)||{};
  const F=(l,v,w)=>`<div class="fl" style="flex:${w||1}"><span class="lb">${esc(l)}</span><span class="vl">${v?esc(v):"&nbsp;"}</span></div>`;
  const B=(on,t)=>`<span class="bx">${on?"☒":"☐"} ${esc(t)}</span>`;
  const ph=c&&c.photo&&c.photo.url?`<img src="${c.photo.url}" alt="Photo">`:`<span>Photo d'identité<br>35 × 45 mm<br>fond blanc</span>`;
  const cats=c?c.cats:[],type=c?c.type:"";
  const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fiche de renseignements${c?" — "+esc((c.nom||"")+" "+(c.prenom||"")):" (vierge)"}</title>
<style>@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font:12px/1.4 Arial,Helvetica,sans-serif;color:#111;margin:0;padding:14px;max-width:800px;margin:auto}
h1{font-size:19px;margin:0}h2{font-size:12.5px;text-transform:uppercase;letter-spacing:.04em;margin:14px 0 6px;padding-bottom:3px;border-bottom:1.5px solid #111}
.top{display:flex;gap:14px;align-items:flex-start}.top>div:first-child{flex:1}.sub{color:#444;margin-top:3px}
.ph{width:105px;height:135px;border:1px dashed #666;display:flex;align-items:center;justify-content:center;text-align:center;font-size:10px;color:#666;overflow:hidden;flex:none}.ph img{width:100%;height:100%;object-fit:cover}
.row{display:flex;gap:10px;margin:5px 0;flex-wrap:wrap}.fl{min-width:130px}.lb{display:block;font-size:10px;color:#555;text-transform:uppercase}.vl{display:block;border-bottom:1px solid #888;min-height:18px;padding:1px 2px}
.bx{display:inline-block;margin:2px 14px 2px 0;white-space:nowrap}.note{font-size:10.5px;color:#444}.sig{display:flex;gap:20px;margin-top:10px}.sig>div{flex:1;border:1px solid #888;min-height:70px;padding:5px;font-size:10.5px}
.np{margin:0 0 12px;padding:8px 14px;font-size:13px;cursor:pointer}@media print{.np{display:none}body{padding:0}}</style></head><body>
<button class="np" onclick="print()">Imprimer / Enregistrer en PDF</button>
<div class="top"><div><h1>Fiche de renseignements du stagiaire</h1><div class="sub"><b>${esc(strNom()||"Structure organisatrice")}</b>${S.centre.ville?" · "+esc(S.centre.ville):""}</div>
<div class="row">${F("Formation",rc.label+" — "+rc.name,3)}${F("N° de session",c?sessNum(c):"",1)}</div>
<div class="row">${F("Période",c&&arrOf(c)?periodTxt(c):"",2)}${F("Catégorie(s)",cats.join(", "),1)}</div>
<div class="row">${B(type!=="CACES"&&!!c,"ACES (autorisation de conduite)")}${B(type==="CACES","CACES®")}${B(i&&c&&c.profil==="initiale","Formation initiale")}${B(c&&c.profil==="recyclage","Recyclage")}</div></div><div class="ph">${ph}</div></div>
<h2>1. Identité</h2><div class="row">${F("Nom",c&&c.nom,1)}${F("Prénom",c&&c.prenom,1)}${F("Date de naissance",c&&c.naissance?frDate(c.naissance):"",1)}</div>
<div class="row">${F("Adresse mail",c&&c.email,2)}${F("Téléphone",c&&c.tel,1)}${F("Poste occupé",i.poste,1)}</div>
<h2>2. Employeur (entreprise qui délivre l'autorisation de conduite)</h2>
<div class="row">${F("Entreprise",c&&c.entreprise,2)}${F("SIRET",emp.siret,1)}</div><div class="row">${F("Adresse",emp.adr,2)}${F("Signataire de l'autorisation (nom, fonction)",emp.sg,2)}</div>
<h2>3. Conduite d'engins</h2>
<div>Champ d'intervention : ${CHAMPS.map(x=>B((i.champs||[]).includes(x),x)).join("")}${i.champAutre?` <span class="note">(${esc(i.champAutre)})</span>`:""}</div>
<div>Niveau : ${NIVEAUX.map(([k,l])=>B(i.niveau===k,l)).join("")}</div>
<div>Expérience : ${EXPS.map(x=>B(i.exp===x,x)).join("")}</div>
<div class="row">${F("CACES® ou autorisation déjà obtenus (recommandation, catégorie, n°, date) — obligatoire en cas de recyclage",i.cacesDetenus,1)}</div>
<h2>4. Santé et aménagements</h2>
<div>Attestation du médecin du travail d'absence de contre-indication à la conduite : ${B(i.attestMed==="oui","Oui, fournie")}${B(i.attestMed==="enc","En cours")}${B(i.attestMed==="non","Non")} <span class="note">— ne rien détailler de l'état de santé</span></div>
<div>Besoin d'un aménagement pour suivre la formation : ${B(i.adaptation==="oui","Oui (le référent vous contactera)")}${B(i.adaptation==="non","Non")}</div>
<h2>5. Engagements</h2>
<p class="note">${B(!!(c&&i.certifieLe),"Je certifie sur l'honneur l'exactitude des informations ci-dessus et m'engage à signaler toute modification avant la session.")}<br>${B(!!(c&&i.certifieLe),consentText())}</p>
${i.certifieLe?`<p class="note">Fiche validée en ligne le ${new Date(i.certifieLe).toLocaleString("fr-FR")}.</p>`:""}
<div class="sig"><div>Fait à ………………………… le …… / …… / ……<br><br>Signature du stagiaire</div><div>Contrôle d'identité par le formateur ou le testeur :<br>${B(false,"CNI")}${B(false,"Passeport")}${B(false,"Titre de séjour")}${B(false,"Permis")}<br>Vérifié par : ………………………</div><div>Réservé à la structure :<br>${B(false,"Dossier complet")}${B(false,"Photo conforme")}<br>Formateur : ${esc(c?intName(intById(c.formateurId)):"")}<br>Testeur : ${esc(c?intName(intById(c.testeurId)):"")}</div></div>
<p class="note" style="margin-top:10px">Données traitées par ${esc(strWho())}${strOrg()?" et "+esc(strOrg()):""} pour l'organisation de la formation, de l'évaluation et de la délivrance des autorisations. Droits d'accès, de rectification et d'effacement : ${esc(S.centre.rgpdMail||S.centre.secEmail||"auprès de la structure")}.</p>
</body></html>`;return html;}

/* ---------- ZIP sans bibliothèque (méthode « stockée ») ---------- */
const CRC_T=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
const crc32=u=>{let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRC_T[(c^u[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;};
function zipBuild(files){const enc=new TextEncoder(),parts=[],cd=[];let off=0;const n=new Date(),dt=((n.getFullYear()-1980)<<9)|((n.getMonth()+1)<<5)|n.getDate(),tm=(n.getHours()<<11)|(n.getMinutes()<<5)|(n.getSeconds()>>1);
  files.forEach(f=>{const nm=enc.encode(f.name),d=typeof f.data==="string"?enc.encode(f.data):f.data,crc=crc32(d);
    const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(10,tm,true);lh.setUint16(12,dt,true);lh.setUint32(14,crc,true);lh.setUint32(18,d.length,true);lh.setUint32(22,d.length,true);lh.setUint16(26,nm.length,true);
    parts.push(new Uint8Array(lh.buffer),nm,d);
    const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(12,tm,true);ch.setUint16(14,dt,true);ch.setUint32(16,crc,true);ch.setUint32(20,d.length,true);ch.setUint32(24,d.length,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
    cd.push(new Uint8Array(ch.buffer),nm);off+=30+nm.length+d.length;});
  const cl=cd.reduce((a,x)=>a+x.length,0),e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cl,true);e.setUint32(16,off,true);
  return new Blob([...parts,...cd,new Uint8Array(e.buffer)],{type:"application/zip"});}
const dataUrlBytes=u=>{const b=atob(String(u).split(",")[1]||""),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a;};
async function gSave(name,data,type){let dl=null;try{dl=await withTO(window.claude&&window.claude.use("downloads"),6000);}catch(e){}
  if(dl){try{await dl.save({filename:name,data});toast("Fichier enregistré : "+name);return true;}catch(e){if(e&&e.code==="declined")return false;}}
  try{const u=URL.createObjectURL(data instanceof Blob?data:new Blob([data],{type:type||"application/octet-stream"})),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);toast("Téléchargement lancé : "+name);return true;}
  catch(e){toast("Téléchargement impossible ici : utilisez l'envoi par mail",true);return false;}}
function allDocsZip(){const L=exList(),f=[],P=(p,d)=>f.push({name:p,data:d});
  P("LISEZMOI.txt",`Documents du banc d'évaluation — ${strNom()||"structure"} — ${new Date().toLocaleDateString("fr-FR")}\n\n${L.length} dossier(s).\n\nfiche-vierge-*.html : fiche de renseignements à imprimer (ouvrir, puis Imprimer > Enregistrer en PDF)\nfiches-renseignements/ : fiche pré-remplie par personne\ndossiers-json/ : dossier complet par personne (format ${FMT.dossier} v${FMT.version})\nsuivi-pedagogique/, feuilles-de-test/, attestations/ : textes prêts à envoyer\nphotos/ : photos d'identité\n*.csv, dossiers.json : exports pour Excel ou un autre logiciel\ncontrat-interface.json : description des échanges avec un autre logiciel (ERP, KODO…)\n`);
  Object.keys(RECOS).forEach(k=>P(`fiche-vierge-${k}.html`,ficheHtml(null,k)));
  L.forEach(c=>{const s=candSlug(c);P(`fiches-renseignements/${s}.html`,ficheHtml(c));P(`dossiers-json/${s}.json`,JSON.stringify(toDossier(c,true),null,1));
    try{P(`suivi-pedagogique/${s}.txt`,pedagoText(c));}catch(e){}try{P(`feuilles-de-test/${s}.txt`,testText(c));}catch(e){}
    try{Object.keys(ped(c).val||{}).forEach(p=>P(`attestations/${s}-${p==="theo"?"theorie":"pratique-"+p}.txt`,attText(c,p)));}catch(e){}
    if(c.photo&&c.photo.url){try{P(`photos/${s}.jpg`,dataUrlBytes(c.photo.url));}catch(e){}}});
  P("inscriptions.csv",csvInscriptions(L));P("resultats.csv",csvResultats(L));P("emargements.csv",csvEmarg(L));P("dossiers.json",exportJson(L,true));P("contrat-interface.json",JSON.stringify(contratInterface(),null,1));
  return {blob:zipBuild(f),n:L.length,files:f.length};}

/* ---------- connexions : URL, clé, événements, contrat d'interface ---------- */
const CONN_EV=[["inscription.recue","Fiche d'inscription reçue"],["session.planifiee","Demande / session planifiée"],["emargement.signe","Émargement signé"],["test.termine","Test terminé (feuilles de test)"],["decision.prise","Décision (CACES® à délivrer / avis ACES)"],["documents.remis","Documents remis"]];
const connOf=()=>{S.centre.conn=S.centre.conn||{};return S.centre.conn;};
const keyOfT=t=>{try{return localStorage.getItem("caces.connkey."+t)||"";}catch(e){return "";}};
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");
async function hmacHex(key,msg){const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(key),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return hex(await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(msg)));}
async function gSend(t,event,donnees){const cn=connOf(),u=String(cn[t+"Url"]||"").trim();
  if(!/^https?:\/\/[^\s]+$/i.test(u))return {ok:false,msg:"Renseignez d'abord une adresse (URL) valide."};
  const body=JSON.stringify({format:FMT.export+".evenement",version:FMT.version,evenement:event,envoyeLe:new Date().toISOString(),structure:{nom:strNom(),type:strType()},donnees}),key=keyOfT(t),h={"Content-Type":"application/json","X-Caces-Event":event};
  if(key){try{h["X-Caces-Signature"]="sha256="+await hmacHex(key,body);}catch(e){}}
  try{const r=await withTO(fetch(u,{method:"POST",headers:h,body}),12000);return {ok:r.ok,msg:r.ok?"Reçu par le serveur (réponse "+r.status+")":"Le serveur a répondu "+r.status};}
  catch(e){return {ok:false,msg:"Envoi impossible depuis cette page (les pages hébergées sur Claude bloquent en général les appels vers un serveur externe, ou le serveur refuse l'origine). L'application installée n'aura pas cette limite. Détail : "+(e&&e.message||e)};}}
function contratInterface(){return {format:"dkgroup.caces.contrat-interface",version:FMT.version,description:"Comment l'application échange avec un autre logiciel (ERP, plateforme de formation, KODO, Make, Zapier, n8n…).",
  structure:{nom:strNom(),type:strType(),entites:entList(),organismeTesteur:strOrg()||null},
  sortant_webhook:{etat:"Envoi manuel depuis l'onglet Échanges ; automatique dans l'application installée",methode:"POST",contentType:"application/json",
    entetes:{"X-Caces-Event":"nom de l'événement","X-Caces-Signature":"sha256=<HMAC-SHA256 du corps brut, clé secrète partagée> (si une clé est renseignée)"},
    corps:{format:FMT.export+".evenement",version:FMT.version,evenement:"voir evenements",envoyeLe:"ISO 8601",structure:{nom:"",type:""},donnees:"dossier candidat (format "+FMT.dossier+") ou liste de dossiers"},
    evenements:CONN_EV.map(([k,l])=>({evenement:k,quand:l})),reponseAttendue:"HTTP 2xx = reçu ; autre = nouvel essai (application installée)"},
  entrant_api_rest:{etat:"Cible de l'application autonome (non disponible dans cette page)",base:"https://<votre-serveur>/api/v1",authentification:"Authorization: Bearer <jeton> ou X-Api-Key",
    routes:[{m:"GET",p:"/dossiers?depuis=<ISO>&etat=<invite|inscrit|termine>",r:"liste de dossiers "+FMT.dossier},{m:"GET",p:"/dossiers/{id}",r:"un dossier"},{m:"PUT",p:"/dossiers/{id}",r:"mise à jour d'un dossier"},{m:"POST",p:"/demandes",r:"créer une demande client (+ personnes)"},{m:"GET",p:"/sessions?du=&au=",r:"planning"},{m:"POST",p:"/webhooks",r:"déclarer une adresse de rappel"}]},
  fichiers:{export:[{nom:"dossiers.json",format:FMT.export},{nom:"inscriptions.csv",separateur:";",encodage:"UTF-8 avec BOM"},{nom:"resultats.csv"},{nom:"emargements.csv"}],import:["JSON "+FMT.export+" / "+FMT.dossier,"CSV d'inscriptions (modèle téléchargeable)"]},
  courriel:"Envoi des exports et feuilles par Gmail (pièces jointes) vers n'importe quelle adresse : boîte du secrétariat, import automatique d'un logiciel, règle Make/Zapier.",
  champsDossier:["meta","demande","candidat","photo","formation","emargement","suivi","validationFormation","theorie","pratique","decision","transmission","remise"],
  securite:["HTTPS obligatoire","clé secrète conservée uniquement sur l'appareil (jamais dans l'export)","signature HMAC pour vérifier l'origine","photos et signatures : option à cocher, données personnelles"]};}
function profilConnexion(){const cn=connOf();return {format:"dkgroup.caces.connexion",version:FMT.version,structure:{nom:strNom(),ville:S.centre.ville||"",type:strType(),entites:S.centre.entites||[],organismeTesteur:strOrg(),secretariat:S.centre.secEmail||""},
  cibles:["principal","kodo"].map(t=>({id:t,url:cn[t+"Url"]||"",evenements:(cn[t+"Ev"]||[]),formatFichier:cn.format||"json"})),note:"La clé secrète n'est jamais incluse : à ressaisir sur chaque appareil."};}
function applyProfil(j){if(!j||j.format!=="dkgroup.caces.connexion")throw new Error("Ce fichier n'est pas un profil de connexion");const s=j.structure||{},cn=connOf();
  Object.assign(S.centre,{nom:s.nom||S.centre.nom||"",ville:s.ville||S.centre.ville||"",type:s.type||S.centre.type||"mixte",entites:s.entites||S.centre.entites||[],organisme:s.organismeTesteur||S.centre.organisme||"",secEmail:s.secretariat||S.centre.secEmail||""});
  (j.cibles||[]).forEach(t=>{if(t.id==="principal"||t.id==="kodo"){cn[t.id+"Url"]=t.url||"";cn[t.id+"Ev"]=t.evenements||[];}});if(j.cibles&&j.cibles[0]&&j.cibles[0].formatFichier)cn.format=j.cibles[0].formatFichier;saveCentre();}

/* ---------- vue : réglages structure, documents, connexions ---------- */
S.gx={reco:"R489",msg:{},busy:null};
function viewStructure(){const c=S.centre,cn=connOf();
  return `<section class="panel pad"><div class="eyebrow">Réglages · une seule fois</div><h2 class="xh2">Structure</h2>
  <p class="note" style="margin-top:0">Tous les textes (fiche d'inscription, accord d'utilisation des données, mails, attestations, fiche imprimée) reprennent ces réglages : rien n'est écrit en dur. Fonctionne pour une entreprise (ACES), un centre de formation (CACES®) ou les deux.</p>
  <div class="seg" style="margin-bottom:10px">${STRTYPES.map(([k,l])=>`<button data-act="g_type" data-v="${k}" aria-pressed="${strType()===k}">${l}</button>`).join("")}</div>
  <div class="row" style="gap:10px;flex-wrap:wrap"><label class="f" style="flex:1;min-width:200px">Nom de la structure<input data-xcentre="nom" value="${esc(c.nom||"")}" placeholder="Ex. DK Group"></label><label class="f" style="flex:1;min-width:140px">Ville<input data-xcentre="ville" value="${esc(c.ville||"")}" placeholder="Ville"></label>
  <label class="f" style="flex:1;min-width:200px">Organisme testeur <span class="note">(facultatif, pour le CACES®)</span><input data-xcentre="organisme" value="${esc(c.organisme||"")}" placeholder="Laisser vide tant qu'il n'est pas choisi"></label></div>
  <div class="row" style="gap:10px;flex-wrap:wrap;margin-top:8px"><label class="f" style="flex:1;min-width:200px">Mail du secrétariat<input type="email" data-xcentre="secEmail" value="${esc(c.secEmail||"")}" placeholder="secretariat@…"></label><label class="f" style="flex:1;min-width:200px">Mail pour les demandes RGPD<input type="email" data-xcentre="rgpdMail" value="${esc(c.rgpdMail||"")}" placeholder="par défaut : le secrétariat"></label></div>
  <label class="f" style="margin-top:8px">Entreprises employeuses (une par ligne : <span class="mono">Nom | SIRET | Adresse | Signataire de l'autorisation</span>, seul le nom est obligatoire)<textarea data-gent="1" rows="4" style="width:100%" placeholder="DK Working | 123 456 789 00012 | 1 rue … | Prénom Nom, gérant&#10;DT Signs">${esc((c.entites||[]).join("\n"))}</textarea></label>
  <p class="note">Ces entreprises apparaissent comme choix dans la fiche d'inscription, les coordonnées et le signataire s'impriment sur la fiche. Une entreprise extérieure choisit « Autre » et les renseigne elle-même.</p>
  <p class="note"><b>Texte d'accord affiché au stagiaire :</b> « ${esc(consentText())} »</p></section>`;}
function viewDocs(){const L=exList(),g=S.gx;
  return `<section class="panel pad"><div class="eyebrow">Télécharger</div><h2 class="xh2">Documents</h2>
  <p class="note" style="margin-top:0">Fiche de renseignements (vierge ou pré-remplie) à imprimer ou à enregistrer en PDF, et tous les documents des dossiers affichés (${L.length}) dans une archive ZIP.</p>
  <div class="row" style="gap:10px;align-items:flex-end;flex-wrap:wrap"><label class="f">Fiche vierge pour<select data-gblank="1">${Object.keys(RECOS).map(k=>`<option value="${k}" ${g.reco===k?"selected":""}>${RECOS[k].label} — ${esc(RECOS[k].name)}</option>`).join("")}</select></label>
  <button class="btn pri" data-act="g_fiche0">Télécharger la fiche vierge</button><button class="btn pri" data-act="g_zip" ${L.length&&!g.busy?"":"disabled"}>${g.busy==="zip"?"Préparation…":"Tout télécharger (ZIP)"}</button></div>
  ${L.length?`<div class="tscroll" style="margin-top:10px"><table><thead><tr><th>Personne</th><th>Formation</th><th>Dates</th><th></th></tr></thead><tbody>${L.slice(0,40).map(c=>`<tr><td>${candName(c)}<div class="note">${esc(c.entreprise||"")}</div></td><td>${RECOS[c.reco].label} ${c.cats.join(", ")}</td><td class="mono">${arrOf(c)?periodTxt(c):"—"}</td><td><button class="btn" data-act="g_fiche" data-id="${c.id}">Fiche pré-remplie</button></td></tr>`).join("")}</tbody></table></div>`:""}
  <p class="note">La fiche s'ouvre dans un fichier HTML autonome : l'ouvrir puis « Imprimer » → « Enregistrer au format PDF ».</p></section>`;}
function viewConn(){const cn=connOf(),g=S.gx;
  const tg=(t,label,ph)=>{const ev=cn[t+"Ev"]||[],m=g.msg[t];return `<div class="excard" style="min-width:260px;flex:1"><b>${label}</b>
    <label class="f" style="margin:8px 0 0">Adresse (URL) de réception<input data-gconn="${t}Url" value="${esc(cn[t+"Url"]||"")}" placeholder="${ph}" inputmode="url"></label>
    <label class="f" style="margin:8px 0 0">Clé secrète (signature) <span class="note">stockée seulement sur cet appareil</span><input type="password" data-gkey="${t}" value="${esc(keyOfT(t))}" autocomplete="off"></label>
    <div class="note" style="margin:8px 0 4px">Événements à envoyer :</div><div class="row" style="gap:6px;flex-wrap:wrap">${CONN_EV.map(([k,l])=>`<button class="pill ${ev.includes(k)?"ok":"mut"}" style="cursor:pointer;border:0" data-act="g_ev" data-t="${t}" data-v="${k}" aria-pressed="${ev.includes(k)}" title="${esc(l)}">${ev.includes(k)?"✓ ":""}${k}</button>`).join("")}</div>
    <div class="row" style="gap:8px;margin-top:10px"><button class="btn" data-act="g_test" data-t="${t}" ${g.busy?"disabled":""}>Tester</button><button class="btn pri" data-act="g_send" data-t="${t}" ${g.busy||!exList().length?"disabled":""}>Envoyer les dossiers affichés</button></div>
    ${m?`<p class="note" style="color:${m.ok?"#15803d":"#b45309"};margin:8px 0 0">${esc(m.msg)}</p>`:""}</div>`;};
  return `<section class="panel pad"><div class="eyebrow">Relier à un autre logiciel</div><h2 class="xh2">Connexions</h2>
  <p class="note" style="margin-top:0">Chaque événement est envoyé en <b>POST JSON</b> signé (en-tête <span class="mono">X-Caces-Signature</span>) à l'adresse indiquée : ERP, plateforme KODO, Make, Zapier, n8n ou votre propre serveur. Les données ont le format « ${FMT.dossier} » ; le contrat complet est téléchargeable ci-dessous.</p>
  <div class="row" style="gap:12px;align-items:stretch;flex-wrap:wrap">${tg("principal","Serveur ou ERP","https://…/webhook")}${tg("kodo","KODO (plateforme de formation)","https://…")}</div>
  <div class="alert warn" style="margin-top:10px"><b>Limite de cette page</b> : hébergée sur Claude, elle ne peut en général pas appeler un serveur externe : « Tester » peut échouer ici même si l'adresse est bonne. Les réglages ci-dessus sont conservés et se reprennent tels quels dans l'application installée (tablette, APK), qui enverra automatiquement, y compris au retour de la connexion. D'ici là, les exports et l'envoi par mail servent de passerelle.</div>
  <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn pri" data-act="g_contrat">Télécharger le contrat d'interface (JSON)</button><button class="btn" data-act="g_profil">Exporter le profil de connexion</button><label class="btn" style="display:inline-flex;align-items:center">Importer un profil<input type="file" accept=".json,application/json" data-gprofil="1" hidden></label></div></section>`;}
function viewEchanges(){let h=viewEchanges0();const m="<section class=\"panel pad\"><div class=\"xsec\" style=\"margin-top:0\"><span class=\"stepn\">1</span>",i=h.indexOf(m);
  h=h.replace("Échanges de données","Réglages et échanges");const top=viewStructure(),bot=viewDocs()+viewConn();return i>0?h.slice(0,i)+top+h.slice(i)+bot:h+top+bot;}

/* ---------- événements (phase de capture : passent avant les écouteurs existants) ---------- */
app.addEventListener("click",async e=>{const b=e.target.closest("[data-act]");if(!b||b.disabled||!/^g_/.test(b.dataset.act||""))return;e.stopImmediatePropagation();const a=b.dataset.act,g=S.gx,cn=connOf();
  switch(a){
    case "g_type":S.centre.type=b.dataset.v;saveCentre();render();return;
    case "g_fiche0":await gSave(`fiche-de-renseignements-vierge-${g.reco}.html`,ficheHtml(null,g.reco),"text/html");return;
    case "g_fiche":{const c=S.cands[b.dataset.id];if(c)await gSave(`fiche-de-renseignements-${candSlug(c)}.html`,ficheHtml(c),"text/html");return;}
    case "g_zip":{g.busy="zip";render();try{const z=allDocsZip();await gSave(`documents-caces-${isoD(new Date())}.zip`,z.blob,"application/zip");}catch(er){toast("Archive impossible : "+(er.message||er),true);}g.busy=null;render();return;}
    case "g_ev":{const t=b.dataset.t,k=b.dataset.v,L=cn[t+"Ev"]||[];cn[t+"Ev"]=L.includes(k)?L.filter(x=>x!==k):[...L,k];saveCentre();render();return;}
    case "g_test":{const t=b.dataset.t;g.busy=t;render();g.msg[t]=await gSend(t,"test.ping",{message:"Test de connexion",structure:strNom()});g.busy=null;render();return;}
    case "g_send":{const t=b.dataset.t,L=exList();g.busy=t;render();const r=await gSend(t,"export.dossiers",L.map(c=>toDossier(c,false)));g.msg[t]=r;g.busy=null;render();return;}
    case "g_contrat":await gSave("contrat-interface-caces.json",JSON.stringify(contratInterface(),null,1),"application/json");return;
    case "g_profil":await gSave("profil-connexion-caces.json",JSON.stringify(profilConnexion(),null,1),"application/json");return;
  }},true);
app.addEventListener("input",e=>{const t=e.target;
  if(t.dataset&&t.dataset.gent){S.centre.entites=t.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);clearTimeout(timers.gc);timers.gc=setTimeout(()=>{delete timers.gc;saveCentre();},700);e.stopImmediatePropagation();return;}
  if(t.dataset&&t.dataset.gconn){connOf()[t.dataset.gconn]=t.value.trim();clearTimeout(timers.gc);timers.gc=setTimeout(()=>{delete timers.gc;saveCentre();},700);e.stopImmediatePropagation();return;}
  if(t.dataset&&t.dataset.gkey){try{localStorage.setItem("caces.connkey."+t.dataset.gkey,t.value);}catch(er){}e.stopImmediatePropagation();return;}
  if(t.dataset&&t.dataset.gblank){S.gx.reco=t.value;e.stopImmediatePropagation();return;}},true);
app.addEventListener("change",async e=>{const t=e.target;if(!t.dataset||!t.dataset.gprofil)return;e.stopImmediatePropagation();const f=t.files&&t.files[0];if(!f)return;
  try{applyProfil(JSON.parse(await f.text()));toast("Profil importé");render();}catch(er){toast(er.message||"Profil illisible",true);}t.value="";},true);
