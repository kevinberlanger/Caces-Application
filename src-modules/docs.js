/* =========================================================================
   DOCUMENTS : attestation, suivi, résultats, autorisation de conduite pré-remplie,
   PDF, envoi automatique par mail, consultation par date
   ========================================================================= */
const DOC_CSS=`@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font:12.5px/1.45 Arial,Helvetica,sans-serif;color:#111;margin:0 auto;padding:16px;max-width:794px;background:#fff}
.hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2.5px solid #111;padding-bottom:8px;margin-bottom:14px}.hd b{font-size:15px}.hd span{font-size:11px;color:#444;text-align:right}
h1{font-size:22px;margin:4px 0 2px;text-transform:uppercase;letter-spacing:.02em}h2{font-size:12.5px;text-transform:uppercase;letter-spacing:.04em;margin:16px 0 6px;padding-bottom:3px;border-bottom:1.5px solid #111}
.c{text-align:center}.big{font-size:20px;font-weight:700;text-align:center;margin:10px 0}.note{font-size:10.5px;color:#444}.ph{width:96px;height:124px;border:1px dashed #666;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;overflow:hidden;flex:none;text-align:center}.ph img{width:100%;height:100%;object-fit:cover}
table{border-collapse:collapse;width:100%;margin:4px 0}th,td{border:1px solid #888;padding:4px 6px;text-align:left;vertical-align:top;font-size:11.5px}th{background:#eee;font-size:10.5px;text-transform:uppercase}
.row{display:flex;gap:12px;margin:5px 0;flex-wrap:wrap}.fl{flex:1;min-width:130px}.lb{display:block;font-size:10px;color:#555;text-transform:uppercase}.vl{display:block;border-bottom:1px solid #888;min-height:18px;padding:1px 2px}
.bx{display:inline-block;margin:2px 14px 2px 0}.nb{display:inline-block;width:14px;height:14px;border:1.5px solid #111;text-align:center;line-height:12px;font-weight:700;font-size:12px;vertical-align:middle}
.sig{display:flex;gap:18px;margin-top:14px;page-break-inside:avoid}.sig>div{flex:1;border:1px solid #888;min-height:96px;padding:6px;font-size:11px}.sig img{max-height:60px;max-width:100%;display:block;margin-top:4px}
.ok{color:#15803d;font-weight:700}.ko{color:#b91c1c;font-weight:700}.pill{display:inline-block;padding:2px 9px;border-radius:99px;font-size:11px;font-weight:700;border:1px solid #888}.pill.ok{background:#dcfce7;border-color:#15803d}.pill.ko{background:#fee2e2;border-color:#b91c1c}
.ft{margin-top:18px;border-top:1px solid #bbb;padding-top:6px;font-size:10px;color:#666}.np{margin:0 0 12px;padding:8px 14px;font-size:13px;cursor:pointer}@media print{.np{display:none}body{padding:0}}`;
function docShell(title,body,c){const ref=c?`${c.reco} · ${(c.nom||"").toUpperCase()} ${c.prenom||""}`:"";
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}${ref?" — "+esc(ref):""}</title><style>${DOC_CSS}</style></head><body>
<button class="np" onclick="print()">Imprimer / Enregistrer en PDF</button>
<div class="hd"><div><b>${esc(strNom()||"Structure organisatrice")}</b><div class="note">${esc(S.centre.ville||"")}</div></div><span>${esc(title)}<br>Édité le ${new Date().toLocaleDateString("fr-FR")}</span></div>${body}
<div class="ft">Document généré par le banc d'évaluation${c?" · dossier "+esc(c.code||""):""}${strOrg()?" · organisme testeur : "+esc(strOrg()):""}.</div></body></html>`;}
const fld=(l,v,w)=>`<div class="fl" style="flex:${w||1}"><span class="lb">${esc(l)}</span><span class="vl">${v?esc(v):"&nbsp;"}</span></div>`;
const nomComplet=c=>`${(c.nom||"").toUpperCase()} ${c.prenom||""}`.trim();

function attestHtml(c,part){const P=ped(c),v=P.val[part];if(!v)return null;const rc=RECOS[c.reco],theo=part==="theo",pg=pedProg(c,theo?"theo":part);
  return docShell("Attestation de fin de formation",`<h1 class="c">Attestation de fin de formation</h1><p class="c">${theo?"Partie théorique":"Partie pratique — catégorie "+esc(part)}</p>
  <p class="c" style="margin-top:18px">${esc(strNom()||"La structure organisatrice")} atteste que</p><div class="big">${esc(nomComplet(c))}</div>
  <p class="c">${c.naissance?"né(e) le "+frDate(c.naissance):""}${c.entreprise?" · "+esc(c.entreprise):""}</p>
  <p class="c" style="margin-top:14px">a suivi la formation<br><b>${esc(rc.label)} — ${esc(rc.name)}</b>${theo?"":"<br>catégorie "+esc(part)+" : "+esc(catLabel(c.reco,part))}<br>${esc(periodTxt(c))}.</p>
  <p class="c">Évaluation des acquis : <b>${pg.x} / ${pg.n}</b> objectifs acquis.</p>
  <div class="sig"><div>Fait à ${esc(S.centre.ville||"…………")}, le ${new Date(v.at).toLocaleDateString("fr-FR")}<br>Le formateur : <b>${esc(v.fname||"")}</b>${v.sig?`<img src="${v.sig}" alt="Signature">`:""}</div><div>Cachet de la structure</div></div>
  <p class="note" style="margin-top:12px">Cette attestation ne vaut ni CACES®, ni autorisation de conduite.</p>`,c);}

function suiviHtml(c){const P=ped(c),R=pedRows(c),pr=pedProg(c);let g="";const sym=["","/","✕"];
  const rows=R.map(r=>{const h=r.gl!==g?(g=r.gl,`<tr><th colspan="3">${esc(g)}</th></tr>`):"";const v=P.m[r.k]||0;return h+`<tr><td style="width:26px"><span class="nb">${sym[v]}</span></td><td>${r.num?esc(r.num)+". ":""}${esc(r.l)}</td><td style="width:34%">${esc(P.n[r.k]||"")}</td></tr>`;}).join("");
  return docShell("Fiche de suivi pédagogique",`<h1>Suivi pédagogique</h1><p><b>${esc(nomComplet(c))}</b> · ${esc(RECOS[c.reco].label)} cat. ${esc(c.cats.join(", "))} · ${c.type==="CACES"?"CACES®":"ACES"} · ${c.profil==="recyclage"?"recyclage":"formation initiale"} · ${esc(periodTxt(c))}</p>
  <p class="note">Légende : <span class="nb"></span> à faire · <span class="nb">/</span> abordé, à consolider · <span class="nb">✕</span> acquis. Formateur : ${esc(intName(intById(c.formateurId))||"—")}</p>
  <table><thead><tr><th></th><th>Objectif</th><th>Annotation</th></tr></thead><tbody>${rows}</tbody></table>
  <p><b>Avancement :</b> ${pr.x}/${pr.n} acquis · ${pr.t} à consolider · ${pr.n-pr.x} restant(s)</p>
  ${P.pb?`<h2>Problématiques signalées</h2><p>${esc(P.pb)}</p>`:""}${P.gen?`<h2>Observations du formateur</h2><p>${esc(P.gen)}</p>`:""}
  <h2>Validation de la formation</h2><p>Théorie : ${P.val.theo?"validée le "+new Date(P.val.theo.at).toLocaleDateString("fr-FR")+(P.val.theo.fname?" par "+esc(P.val.theo.fname):""):"non validée"}<br>${c.cats.map(k=>`Pratique cat. ${esc(k)} : ${P.val[k]?"validée le "+new Date(P.val[k].at).toLocaleDateString("fr-FR"):"non validée"}`).join("<br>")}</p>`,c);}

function resultatsHtml(c){const t=scoreTheo(c),rc=RECOS[c.reco];
  const tb=x=>`<table><thead><tr><th>Thème</th><th style="width:90px">Points</th><th style="width:60px"></th></tr></thead><tbody>${x.map(y=>`<tr><td>${esc(y.name)}</td><td>${fmt(y.s)} / ${fmt(y.m)}</td><td class="${y.ok?"ok":"ko"}">${y.ok?"✓":"✗"}</td></tr>`).join("")}</tbody></table>`;
  const pr=c.cats.map(k=>{const p=(c.prat||{})[k]||{},r=scorePrat(c,k);return `<h2>Pratique — catégorie ${esc(k)} : ${esc(catLabel(c.reco,k))}</h2>${!p.t0?"<p>Non passée.</p>":`<p><b>${fmt(r.tot)} / ${fmt(r.max)}</b> (${fmt(r.pct)} %) — <span class="${r.ok?"ok":"ko"}">${r.ok?"RÉUSSIE":r.elim?"ÉLIMINÉ":"NON RÉUSSIE"}</span>${!p.t1&&!r.elim?" (test non clôturé)":""}</p>${tb(r.themes)}${r.zeroPts.length?`<p class="note">Points d'évaluation à 0 : ${esc(r.zeroPts.join(", "))}</p>`:""}${p.obs&&p.obs._fin?`<p class="note">Observations : ${esc(p.obs._fin)}</p>`:""}`}`;}).join("");
  const dec=c.cats.map(k=>{const d=decisionOf(c,k),lab={avis_favorable:"Avis favorable — autorisation de conduite à établir",avis_defavorable:"Avis défavorable — à reprogrammer",caces_a_delivrer:"CACES® à éditer et remettre",non_obtenu:"CACES® non obtenu (bénéfice de la partie réussie conservé 12 mois)",en_attente:"En attente"}[d];return `<tr><td>${esc(rc.label)} cat. ${esc(k)}</td><td><span class="pill ${/favorable$|delivrer|à éditer/.test(d)&&!/defav/.test(d)?"ok":d==="en_attente"?"":"ko"}">${esc(lab)}</span></td></tr>`;}).join("");
  return docShell("Résultats des tests",`<h1>Résultats des tests</h1><div class="row">${fld("Nom",nomComplet(c),2)}${fld("Naissance",frDate(c.naissance))}${fld("Entreprise",c.entreprise,2)}</div><div class="row">${fld("Formation",rc.label+" — "+rc.name,2)}${fld("Session",periodTxt(c))}${fld("Type",c.type==="CACES"?"CACES®":"ACES")}</div>
  <div class="row">${fld("Formateur",intName(intById(c.formateurId)))}${fld("Testeur",intName(intById(c.testeurId))||c.testeur)}</div>
  <h2>Théorie</h2>${t?`<p><b>${t.s} / ${t.m}</b> (${fmt(t.pct)} %) — <span class="${t.ok?"ok":"ko"}">${t.ok?"RÉUSSIE":"NON RÉUSSIE"}</span>${t.validated?"":" (non encore validée par le testeur)"}</p>${tb(t.themes)}`:"<p>Non passée.</p>"}${pr}
  <h2>Décision</h2><table><tbody>${dec}</tbody></table><p class="note">Critères : au moins 70 % du total et au moins la moyenne dans chaque thème ; aucun point d'évaluation pratique à 0.</p>`,c);}

/* autorisation de conduite : remplie automatiquement à partir des résultats, il ne reste qu'à signer */
const validiteAns=()=>{const n=parseInt(S.centre.validiteAns,10);return n>0&&n<=10?n:5;};
const addYears=(iso,n)=>{const d=new Date((iso||isoD(new Date()))+"T00:00:00");d.setFullYear(d.getFullYear()+n);return isoD(d);};
const favCats=c=>c.cats.filter(k=>["avis_favorable","caces_a_delivrer"].includes(decisionOf(c,k)));
function autoHtml(c){const F=favCats(c);if(!F.length)return null;const i=c.insc||{},emp=i.employeur||entFind(c.entreprise)||{},rc=RECOS[c.reco],P=ped(c),te=intById(c.testeurId);
  const last=c.cats.map(k=>((c.prat||{})[k]||{}).t1).filter(Boolean).sort().pop(),dEval=(last||c.updated||new Date().toISOString()).slice(0,10),fin=addYears(dEval,validiteAns());
  const medOk=i.attestMed==="oui",ph=c.photo&&c.photo.url?`<img src="${c.photo.url}" alt="Photo">`:`<span>Photo<br>d'identité</span>`;
  const fv=P.val.theo||P.val[F[0]]||{};
  return docShell("Autorisation de conduite",`<div style="display:flex;gap:14px;align-items:flex-start"><div style="flex:1"><h1>Autorisation de conduite</h1><p class="note">Établie par l'employeur en application des articles R. 4323-55 et R. 4323-56 du Code du travail.</p></div><div class="ph">${ph}</div></div>
  <h2>Employeur</h2><div class="row">${fld("Entreprise",c.entreprise,2)}${fld("SIRET",emp.siret)}</div><div class="row">${fld("Adresse",emp.adr,2)}</div>
  <h2>Salarié autorisé</h2><div class="row">${fld("Nom",nomComplet(c),2)}${fld("Date de naissance",frDate(c.naissance))}</div><div class="row">${fld("Poste occupé",i.poste,2)}${fld("Identifiant dossier",c.code)}</div>
  <h2>Équipements de travail pour lesquels la conduite est autorisée</h2>
  <table><thead><tr><th>Recommandation</th><th>Catégorie / équipement</th><th style="width:105px">Évaluation du</th><th style="width:105px">Valable jusqu'au</th></tr></thead><tbody>${F.map(k=>`<tr><td>${esc(rc.label)} — ${esc(rc.name)}</td><td><b>${esc(k)}</b> · ${esc(catLabel(c.reco,k))}</td><td>${frDate(dEval)}</td><td>${frDate(fin)}</td></tr>`).join("")}</tbody></table>
  <h2>Éléments pris en compte pour la délivrance</h2>
  <p>${medOk?"☒":"☐"} <b>Aptitude médicale</b> : attestation du médecin du travail d'absence de contre-indication à la conduite${medOk?" (déclarée fournie)":" — <b>à fournir ou à vérifier avant signature</b>"}.</p>
  <p>☒ <b>Contrôle des connaissances et du savoir-faire</b> pour la conduite en sécurité : ${esc(rc.label)}, théorie ${(()=>{const t=scoreTheo(c);return t?fmt(t.pct)+" %":"—";})()} et pratique réussies, formation validée${fv.fname?" par "+esc(fv.fname):""}${te?", évaluation par "+esc(intName(te)):""}${c.type==="CACES"?" ; CACES® n° …………… (à compléter)":""}.</p>
  <p>☐ <b>Connaissance des lieux et des instructions à respecter</b> sur le(s) site(s) d'utilisation : à valider par l'employeur (visite du site, consignes de circulation, protocole de chargement/déchargement).</p>
  <p class="note">Cette autorisation est personnelle. Elle peut être retirée ou suspendue à tout moment si les conditions ne sont plus remplies (comportement dangereux, inaptitude médicale, changement de site ou d'équipement). Elle doit pouvoir être présentée sur demande de l'inspection du travail. Le salarié la conserve sur lui pendant la conduite.</p>
  <div class="sig"><div>Fait à ${esc(S.centre.ville||"…………")}, le …… / …… / ……<br><b>L'employeur</b><br>${esc(emp.sg||"Nom, fonction : ……………………")}<br><br>Signature et cachet</div><div>Le salarié, <b>${esc(nomComplet(c))}</b><br>Lu et pris connaissance<br><br>Signature</div></div>`,c);}

/* registre des documents disponibles pour une personne */
function docsOf(c){const L=[],P=ped(c),t=scoreTheo(c),nowIso=new Date().toISOString();
  if(c.insc&&c.insc.certifieLe)L.push({id:"fiche",label:"Fiche de renseignements",at:c.insc.certifieLe,auto:true,build:()=>ficheHtml(c)});
  Object.entries(P.val).forEach(([k,v])=>L.push({id:"attest-"+k,label:k==="theo"?"Attestation théorie":"Attestation pratique "+k,at:v.at,auto:true,build:()=>attestHtml(c,k)}));
  if(pedProg(c).x||P.pb||P.gen)L.push({id:"suivi",label:"Suivi pédagogique",at:c.updated||nowIso,auto:false,build:()=>suiviHtml(c)});
  const done=c.cats.filter(k=>{const p=(c.prat||{})[k]||{};return p.t1||(p.elim||[]).length;});
  if(t||done.length)L.push({id:"resultats",label:"Résultats des tests",at:(done.map(k=>c.prat[k].t1).filter(Boolean).sort().pop())||c.updated||nowIso,auto:!!t&&t.validated&&done.length===c.cats.length,build:()=>resultatsHtml(c)});
  if(favCats(c).length)L.push({id:"autorisation",label:"Autorisation de conduite (à signer)",at:(done.map(k=>c.prat[k].t1).filter(Boolean).sort().pop())||c.updated||nowIso,auto:true,build:()=>autoHtml(c)});
  return L;}

/* ---------- PDF (bibliothèque chargée à la demande ; repli : fichier HTML) ---------- */
let _h2p=null;
function loadH2P(){if(window.html2pdf)return Promise.resolve(window.html2pdf);if(_h2p)return _h2p;
  _h2p=new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";s.onload=()=>window.html2pdf?res(window.html2pdf):rej(new Error("PDF indisponible"));s.onerror=()=>{_h2p=null;rej(new Error("bibliothèque PDF indisponible (hors connexion ?)"));};document.head.appendChild(s);});return _h2p;}
async function htmlToPdf(html){const h=await withTO(loadH2P(),20000);const fr=document.createElement("iframe");fr.style.cssText="position:fixed;left:-9999px;top:0;width:794px;height:1123px;border:0";document.body.appendChild(fr);
  try{await new Promise(r=>{fr.onload=r;fr.srcdoc=html;});await new Promise(r=>setTimeout(r,350));const d=fr.contentDocument;d.querySelectorAll(".np").forEach(x=>x.remove());
    return await h().set({margin:[6,6,6,6],image:{type:"jpeg",quality:0.93},html2canvas:{scale:2,useCORS:true,windowWidth:794},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"],avoid:["tr",".sig"]}}).from(d.body).outputPdf("blob");}
  finally{fr.remove();}}
async function docFile(c,d){const html=d.build();if(!html)return null;const base=`${d.id}-${candSlug(c)}`;
  try{const b=await htmlToPdf(html);return {name:base+".pdf",blob:b,mime:"application/pdf",pdf:true};}catch(e){return {name:base+".html",blob:new Blob([html],{type:"text/html"}),mime:"text/html",pdf:false,why:e&&e.message};}}
const blobB64=async b=>{const u=new Uint8Array(await b.arrayBuffer());let o="";for(let i=0;i<u.length;i+=0x8000)o+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(o);};
const docDest=()=>String(S.centre.docMail||S.centre.secEmail||"").trim();
async function mailDoc(to,c,d){if(!S.mcp)return {ok:false,msg:"Gmail indisponible ici"};const f=await docFile(c,d);if(!f)return {ok:false,msg:"Document vide"};
  try{await S.mcp.callTool("Gmail","send_message",{to:[to],subject:`${strNom()?"["+strNom()+"] ":""}${d.label} — ${nomComplet(c)} — ${periodTxt(c)}`,body:`Bonjour,\n\nVeuillez trouver en pièce jointe : ${d.label}\n${nomComplet(c)} · ${RECOS[c.reco].label} cat. ${c.cats.join(", ")} · ${periodTxt(c)}.\n${f.pdf?"":"(Format HTML : ouvrir puis imprimer en PDF.)\n"}\nCe document est aussi consultable dans le banc d'évaluation, onglet Documents, à la date de session.\n\nCordialement,`,includeSignature:true,attachments:[{content:await blobB64(f.blob),filename:f.name,mimeType:f.mime}]});return {ok:true,msg:"Envoyé à "+to+(f.pdf?" (PDF)":" (HTML : PDF indisponible)")};}
  catch(e){return {ok:false,queued:e&&e.code==="queued",msg:mcpErrText(e)};}}
/* envoi automatique : chaque document validé part en PDF vers la boîte configurée, une seule fois (c.docSent) */
async function autoScan(){if(autoScan.b)return;const C=S.centre,to=docDest();if(!C.autoMail||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)||!S.mcp||!navigator.onLine||S.quiz||S.reg||S.sat||!SPACES[S.role])return;
  autoScan.b=true;try{let n=0;for(const c of Object.values(S.cands)){if(c.id==="exemple")continue;for(const d of docsOf(c)){const key=c.id+"|"+d.id;if(!d.auto||(c.docSent||{})[d.id]||autoScan.done.has(key)||String(d.at||"")<(C.autoSince||"9999"))continue;
    const r=await mailDoc(to,c,d);if(r.ok){autoScan.done.add(key);const cur=S.cands[c.id]||c;cur.docSent=Object.assign({},cur.docSent,c.docSent||{});cur.docSent[d.id]=new Date().toISOString();persist(cur);toast("Envoyé automatiquement : "+d.label+" — "+nomComplet(c));}else{if(!r.queued)toast("Envoi automatique en échec : "+r.msg,true);return;}
    if(++n>=3)return;}}}finally{autoScan.b=false;}}
autoScan.done=new Set();
setInterval(()=>{autoScan().catch(()=>{});},30000);

/* ---------- aperçu ---------- */
function docClose(){const o=document.getElementById("docov");if(o)o.remove();}
function docOpen(cid,did){const c=S.cands[cid];if(!c)return;const d=docsOf(c).find(x=>x.id===did);if(!d)return;const html=d.build();if(!html)return;docClose();
  const o=document.createElement("div");o.id="docov";o.className="xov";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.dataset.cid=cid;o.dataset.did=did;
  o.innerHTML=`<div class="xmod" style="width:min(920px,96vw);max-height:94vh;display:flex;flex-direction:column"><div class="xmh"><div><div class="eyebrow">${esc(nomComplet(c))}</div><h2>${esc(d.label)}</h2></div><button class="btn" data-dact="close">Fermer</button></div>
  <div style="flex:1;min-height:0;padding:0 14px"><iframe style="width:100%;height:64vh;border:1px solid var(--line);border-radius:8px;background:#fff" sandbox="allow-same-origin" srcdoc="${esc(html)}"></iframe></div>
  <div class="xmf" style="gap:8px;flex-wrap:wrap"><button class="btn pri" data-dact="pdf">Télécharger en PDF</button><button class="btn" data-dact="html">Télécharger en HTML</button><input type="email" id="docto" value="${esc(docDest())}" placeholder="adresse mail" style="flex:1;min-width:180px"><button class="btn" data-dact="mail">Envoyer par mail (PDF)</button></div></div>`;
  document.body.appendChild(o);}
document.addEventListener("click",async e=>{const b=e.target.closest("[data-dact]");if(!b)return;const o=document.getElementById("docov");if(!o)return;const c=S.cands[o.dataset.cid];const d=c&&docsOf(c).find(x=>x.id===o.dataset.did);if(!d){docClose();return;}
  const k=b.dataset.dact;if(k==="close"){docClose();return;}
  if(k==="html"){const h=d.build();await gSave(`${d.id}-${candSlug(c)}.html`,new Blob([h],{type:"text/html"}),"text/html");return;}
  b.disabled=true;const t0=b.textContent;b.textContent="Préparation…";
  try{if(k==="pdf"){const f=await docFile(c,d);if(f&&!f.pdf)toast("PDF indisponible ici ("+(f.why||"hors connexion")+") : fichier HTML fourni",true);if(f)await gSave(f.name,f.blob,f.mime);}
    else if(k==="mail"){const to=(document.getElementById("docto")||{}).value||"";if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)){toast("Adresse mail invalide",true);}else{const r=await mailDoc(to.trim(),c,d);toast(r.msg,!r.ok&&!r.queued);}}}
  finally{b.disabled=false;b.textContent=t0;}},true);

/* ---------- onglet Documents : consultation par date de session ---------- */
S.dv={date:""};
const docDates=()=>[...new Set(Object.values(S.cands).filter(c=>c.id!=="exemple"&&arrOf(c)).map(c=>arrOf(c)))].sort().reverse();
function viewDocuments(){const C=S.centre,dates=docDates(),v=S.dv;if(!v.date||(v.date!=="tous"&&!dates.includes(v.date)))v.date=dates.find(d=>d<=isoD(new Date()))||dates[0]||"tous";
  const L=Object.values(S.cands).filter(c=>c.id!=="exemple"&&(v.date==="tous"||arrOf(c)===v.date)).sort((a,b)=>(a.nom||"").localeCompare(b.nom||""));
  const rows=L.map(c=>{const ds=docsOf(c);return `<tr><td>${candName(c)}<div class="note">${esc(c.entreprise||"")}</div></td><td>${esc(RECOS[c.reco].label)} ${esc(c.cats.join(", "))}<div class="note">${c.type==="CACES"?"CACES®":"ACES"} · ${esc(periodTxt(c))}</div></td>
    <td>${ds.length?ds.map(d=>`<button class="pill ${(c.docSent||{})[d.id]?"ok":"mut"}" style="cursor:pointer;border:0;margin:2px" data-act="d_open" data-id="${c.id}" data-d="${d.id}" title="${(c.docSent||{})[d.id]?"Déjà envoyé par mail le "+new Date(c.docSent[d.id]).toLocaleDateString("fr-FR"):"Ouvrir"}">${(c.docSent||{})[d.id]?"✉ ":""}${esc(d.label)}</button>`).join(""):'<span class="note">Aucun document pour l\'instant</span>'}</td></tr>`;}).join("");
  return `<div class="row hhead"><div style="margin-right:auto"><div class="eyebrow">${SPACES[S.role].label} · par date de session</div><h2 class="htitle">Documents</h2></div></div>
  <section class="panel pad"><div class="row" style="gap:10px;align-items:flex-end;flex-wrap:wrap"><label class="f">Session du<select data-dsel="1">${dates.map(d=>`<option value="${d}" ${v.date===d?"selected":""}>${frDate(d)}</option>`).join("")}<option value="tous" ${v.date==="tous"?"selected":""}>Toutes les dates</option></select></label><span class="pill mut">${L.length} personne(s)</span></div>
  ${L.length?`<div class="tscroll" style="margin-top:10px"><table><thead><tr><th>Personne</th><th>Formation</th><th>Documents (cliquer pour ouvrir, télécharger en PDF ou envoyer)</th></tr></thead><tbody>${rows}</tbody></table></div><p class="note">✉ vert = déjà envoyé par mail. Les documents se mettent à jour tout seuls avec les résultats : ils ne sont jamais figés tant que le dossier évolue.</p>`:`<p class="note">Aucune personne à cette date.</p>`}</section>
  <section class="panel pad"><div class="eyebrow">Envoi automatique</div><h2 class="xh2">Recevoir chaque document validé par mail</h2>
  <p class="note" style="margin-top:0">Dès que vous validez (fiche reçue, attestation signée, résultats complets, autorisation prête), le document part en PDF vers cette boîte, une seule fois. L'appli doit être ouverte sur un appareil du centre.</p>
  <div class="row" style="gap:10px;align-items:flex-end;flex-wrap:wrap"><label class="f" style="flex:1;min-width:220px">Boîte de réception des documents<input type="email" data-xcentre="docMail" value="${esc(C.docMail||"")}" placeholder="${esc(C.secEmail||"vous@exemple.fr")}"></label>
  <label class="f" style="width:170px">Validité de l'autorisation (ans)<input type="number" min="1" max="10" data-xcentre="validiteAns" value="${esc(C.validiteAns||"5")}"></label>
  <button class="btn ${C.autoMail?"":"pri"}" data-act="d_auto">${C.autoMail?"Désactiver l'envoi automatique":"Activer l'envoi automatique"}</button></div>
  ${C.autoMail?`<p class="note" style="color:#15803d">Actif depuis le ${new Date(C.autoSince).toLocaleString("fr-FR")} : seuls les documents validés après cette date partent automatiquement.</p>`:""}</section>`;}
app.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b||b.disabled||!/^d_/.test(b.dataset.act||""))return;e.stopImmediatePropagation();
  if(b.dataset.act==="d_open")docOpen(b.dataset.id,b.dataset.d);
  if(b.dataset.act==="d_auto"){const C=S.centre;if(C.autoMail){C.autoMail=false;}else{if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(docDest())){toast("Renseignez d'abord la boîte de réception",true);return;}C.autoMail=true;C.autoSince=new Date().toISOString();}saveCentre();render();}},true);
app.addEventListener("input",e=>{const t=e.target;if(t.dataset&&t.dataset.dsel){S.dv.date=t.value;e.stopImmediatePropagation();render();}},true);
