/* =========================================================================
   NUMÉROS D'AUTORISATION · TESTS THÉORIQUE ET PRATIQUE · ENVOI STAGIAIRE / ÉQUIPE · DRIVE
   ========================================================================= */
/* numéro d'autorisation (ACES) généré, numéro de CACES® saisi, un par catégorie */
const nums=(c,k)=>((c.nums||{})[k])||{};
const autNum=(c,k)=>nums(c,k).aut||`ACES-${(arrOf(c)||isoD(new Date())).slice(0,4)}-${(c.code||"").toUpperCase()}-${k}`;
const cacesNum=(c,k)=>nums(c,k).caces||"";
function setNum(cid,k,f,v){const c=S.cands[cid];if(!c)return;c.nums=c.nums||{};c.nums[k]=Object.assign({},c.nums[k]);c.nums[k][f]=v.trim();clearTimeout(timers["n"+cid]);timers["n"+cid]=setTimeout(()=>{delete timers["n"+cid];persist(c);},800);}

/* test théorique : synthèse + question par question (mode QCM) */
function testTheoHtml(c){const t=scoreTheo(c);if(!t)return null;const rc=RECOS[c.reco],bank=BANK[bankKey(c)],q=c.theo&&c.theo.qcm,tb=t.themes.map(x=>`<tr><td>${esc(x.name)}</td><td style="width:90px">${fmt(x.s)} / ${fmt(x.m)}</td><td class="${x.ok?"ok":"ko"}" style="width:50px">${x.ok?"✓":"✗"}</td></tr>`).join("");
  const det=q&&q.bits&&q.bits.length===bank.length?`<h2>Détail des réponses</h2><table><thead><tr><th style="width:28px">N°</th><th>Question</th><th style="width:62px">Attendu</th><th style="width:62px">Stagiaire</th><th style="width:30px"></th></tr></thead><tbody>${bank.map((x,i)=>{const okk=q.bits[i]==="1",att=x.a?"Vrai":"Faux",rep=okk?att:(x.a?"Faux":"Vrai");return `<tr><td>${i+1}</td><td>${esc(x.q)}${okk||!x.w?"":`<div class="note">${esc(x.w)}</div>`}</td><td>${att}</td><td>${rep}</td><td class="${okk?"ok":"ko"}">${okk?"✓":"✗"}</td></tr>`;}).join("")}</tbody></table>`:`<p class="note">Saisie par thème (pas de détail question par question).</p>`;
  return docShell("Test théorique",`<h1>Test théorique</h1><div class="row">${fld("Nom",nomComplet(c),2)}${fld("Naissance",frDate(c.naissance))}${fld("Entreprise",c.entreprise,2)}</div><div class="row">${fld("Formation",rc.label+" — "+rc.name,2)}${fld("Session",periodTxt(c))}${fld("Testeur",intName(intById(c.testeurId))||c.testeur)}</div>
  <h2>Résultat</h2><p><b>${t.s} / ${t.m}</b> (${fmt(t.pct)} %) — <span class="${t.ok?"ok":"ko"}">${t.ok?"RÉUSSI":"NON RÉUSSI"}</span>${t.validated?"":" (non encore validé par le testeur)"}</p><table><thead><tr><th>Thème</th><th>Points</th><th></th></tr></thead><tbody>${tb}</tbody></table>${det}`,c);}

/* test pratique : grille complète d'une catégorie, critère par critère */
function testPratHtml(c,k){const p=(c.prat||{})[k];if(!p||!p.t0)return null;const rc=RECOS[c.reco],r=scorePrat(c,k),g=getGrid(c.reco,k);
  const body=g.map(t=>{const pts=t.points.filter(pt=>!(isAces(c)&&p.off&&p.off[pt.id])).map(pt=>{const ac=activeCrits(c,k,pt);if(!ac.length)return "";const s=pointScore(c,k,pt),m=ac.reduce((a,x)=>a+x.max,0);
      return `<tr><td style="width:38px"><b>${esc(pt.num)}</b></td><td>${esc(pt.label)}${ac.length>1?`<div class="note">${ac.map(cr=>esc(cr.label)+" ("+fmt(critScore(c,k,cr))+"/"+cr.max+")").join(" · ")}</div>`:""}</td><td style="width:70px" class="${s<=0?"ko":""}">${fmt(s)} / ${fmt(m)}</td></tr>`;}).join("");
    const th=r.themes.find(x=>x.name===t.name)||{s:0,m:0};return `<h2>${esc(t.name)} — ${fmt(th.s)} / ${fmt(th.m)}</h2><table><tbody>${pts}</tbody></table>`;}).join("");
  return docShell("Test pratique — catégorie "+k,`<h1>Test pratique · catégorie ${esc(k)}</h1><p class="note">${esc(catLabel(c.reco,k))}</p><div class="row">${fld("Nom",nomComplet(c),2)}${fld("Naissance",frDate(c.naissance))}${fld("Entreprise",c.entreprise,2)}</div><div class="row">${fld("Formation",rc.label+" — "+rc.name,2)}${fld("Session",periodTxt(c))}${fld("Testeur",intName(intById(c.testeurId))||c.testeur)}</div>
  <h2>Résultat</h2><p><b>${fmt(r.tot)} / ${fmt(r.max)}</b> (${fmt(r.pct)} %) — <span class="${r.ok?"ok":"ko"}">${r.ok?"RÉUSSI":r.elim?"ÉLIMINÉ":"NON RÉUSSI"}</span>${!p.t1&&!r.elim?" (test non clôturé)":""}</p>${r.zeroPts.length?`<p class="note">Points d'évaluation à 0 : ${esc(r.zeroPts.join(", "))}</p>`:""}${body}${p.obs&&p.obs._fin?`<h2>Observations du testeur</h2><p>${esc(p.obs._fin)}</p>`:""}`,c);}

/* ---------- registre : ajout des tests, des numéros ---------- */
const _docsOf0=docsOf;
docsOf=function(c){const L=_docsOf0(c),t=scoreTheo(c);
  if(t)L.splice(L.findIndex(d=>d.id==="resultats")>=0?L.findIndex(d=>d.id==="resultats"):L.length,0,{id:"test-theo",label:"Test théorique",at:(c.theo&&c.theo.qcm&&c.theo.qcm.date)||c.updated||new Date().toISOString(),auto:!!t.validated,build:()=>testTheoHtml(c)});
  c.cats.forEach(k=>{const p=(c.prat||{})[k]||{};if(p.t0)L.push({id:"test-prat-"+k,label:"Test pratique "+k,at:p.t1||c.updated||new Date().toISOString(),auto:!!(p.t1||(p.elim||[]).length),build:()=>testPratHtml(c,k)});});
  return L;};

/* ---------- destinataires : stagiaire et équipe ---------- */
const STAG_DEF={fiche:false,attest:true,tests:true,resultats:true,autorisation:false,suivi:true};
const STAG_LAB=[["fiche","Fiche de renseignements"],["attest","Attestations"],["tests","Tests théorique et pratique"],["resultats","Résultats"],["autorisation","Autorisation de conduite"],["suivi","Suivi pédagogique"]];
const docGroup=id=>/^attest/.test(id)?"attest":/^test-/.test(id)?"tests":id;
const toStag=d=>!!Object.assign({},STAG_DEF,S.centre.stag||{})[docGroup(d.id)];
async function mailDoc(to,c,d,who){if(!S.mcp)return {ok:false,msg:"Gmail indisponible ici"};const f=await docFile(c,d);if(!f)return {ok:false,msg:"Document vide"};const st=who==="stagiaire";
  try{await S.mcp.callTool("Gmail","send_message",{to:Array.isArray(to)?to:[to],subject:st?`${strNom()?"["+strNom()+"] ":""}Votre ${d.label.toLowerCase()} — ${periodTxt(c)}`:`${strNom()?"["+strNom()+"] ":""}${d.label} — ${nomComplet(c)} — ${periodTxt(c)}`,
    body:st?`Bonjour ${c.prenom||""},\n\nVous trouverez en pièce jointe votre document : ${d.label}\n${RECOS[c.reco].label} · ${periodTxt(c)}.\n\nConservez-le : il peut vous être demandé.\n\nCordialement,`:`Bonjour,\n\nVeuillez trouver en pièce jointe : ${d.label}\n${nomComplet(c)} · ${RECOS[c.reco].label} cat. ${c.cats.join(", ")} · ${periodTxt(c)}.\n${f.pdf?"":"(Format HTML : ouvrir puis imprimer en PDF.)\n"}\nCe document est aussi consultable dans le banc d'évaluation, onglet Documents, à la date de session.\n\nCordialement,`,includeSignature:true,attachments:[{content:await blobB64(f.blob),filename:f.name,mimeType:f.mime}]});
    return {ok:true,msg:"Envoyé à "+(Array.isArray(to)?to.join(", "):to)+(f.pdf?" (PDF)":" (HTML : PDF indisponible)")};}
  catch(e){return {ok:false,queued:e&&e.code==="queued",msg:mcpErrText(e)};}}

/* ---------- Drive : un dossier par entreprise, un sous-dossier par date de session ---------- */
const driveRootOf=c=>(entFind(c&&c.entreprise)||{}).drive||S.centre.driveRoot||"";
const idOfRes=r=>{try{const x=r&&(r.structuredContent||r.payload||r);if(x&&x.id)return x.id;const t=r&&r.content&&r.content[0]&&r.content[0].text;if(t){const j=JSON.parse(t);return j.id||(j.file&&j.file.id)||"";}}catch(e){}return "";};
async function driveFolder(parent,name){const C=S.centre;C.driveF=C.driveF||{};const k=parent+"|"+name;if(C.driveF[k])return C.driveF[k];
  const r=await S.mcp.callTool("Google Drive","create_file",{title:name,mimeType:"application/vnd.google-apps.folder",parentId:parent});const id=idOfRes(r);if(!id)throw new Error("dossier Drive non créé");C.driveF[k]=id;saveCentre();return id;}
async function driveSave(c,d,f){const root=driveRootOf(c);if(!root)return {ok:false,skip:true,msg:"Pas de dossier Drive défini"};if(!S.mcp)return {ok:false,msg:"Drive indisponible ici"};
  try{const sub=await driveFolder(root,"Session "+(arrOf(c)||"sans-date")),pr=await driveFolder(sub,nomComplet(c));
    await S.mcp.callTool("Google Drive","create_file",{title:f.name,base64Content:await blobB64(f.blob),contentMimeType:f.mime,disableConversionToGoogleType:true,parentId:pr});return {ok:true,msg:"Déposé dans le Drive"};}
  catch(e){return {ok:false,msg:"Drive : "+(e&&(e.message||e.code)||e)};}}

/* ---------- envoi automatique : équipe + stagiaire + Drive, chacun une seule fois ---------- */
async function autoScan(){if(autoScan.b)return;const C=S.centre;if(!C.autoMail||!S.mcp||!navigator.onLine||S.quiz||S.reg||S.sat||!SPACES[S.role])return;
  autoScan.b=true;try{let n=0;const mark=(c,key)=>{autoScan.done.add(c.id+"|"+key);const cur=S.cands[c.id]||c;cur.docSent=Object.assign({},cur.docSent,c.docSent||{});cur.docSent[key]=new Date().toISOString();persist(cur);};
    for(const c of Object.values(S.cands)){if(c.id==="exemple")continue;for(const d of docsOf(c)){if(!d.auto||String(d.at||"")<(C.autoSince||"9999"))continue;
      const sent=k=>(c.docSent||{})[k]||autoScan.done.has(c.id+"|"+k),team=docDestsFor(c),stm=splitMail(c.email);
      if(team.length&&!sent(d.id)){const r=await mailDoc(team,c,d,"equipe");if(r.ok){mark(c,d.id);toast("Équipe : "+d.label+" — "+nomComplet(c));}else{if(!r.queued)toast("Envoi automatique en échec : "+r.msg,true);return;}if(++n>=3)return;}
      if(toStag(d)&&stm.length&&!sent(d.id+"@s")){const r=await mailDoc(stm,c,d,"stagiaire");if(r.ok){mark(c,d.id+"@s");toast("Stagiaire : "+d.label+" — "+nomComplet(c));}else{if(!r.queued)toast("Envoi au stagiaire en échec : "+r.msg,true);return;}if(++n>=3)return;}
      if(driveRootOf(c)&&!sent(d.id+"@d")){const f=await docFile(c,d),r=f?await driveSave(c,d,f):{ok:false};if(r.ok){mark(c,d.id+"@d");toast("Drive : "+d.label+" — "+nomComplet(c));}else if(!r.skip){autoScan.done.add(c.id+"|"+d.id+"@d");toast(r.msg||"Drive indisponible",true);}if(++n>=3)return;}}}}
  finally{autoScan.b=false;}}

/* ---------- réglages et saisie des numéros dans l'onglet Documents ---------- */
const _viewDocs0=viewDocuments;
viewDocuments=function(){let h=_viewDocs0();const C=S.centre,st=Object.assign({},STAG_DEF,C.stag||{});
  const rows=Object.values(S.cands).filter(c=>c.id!=="exemple"&&favCats(c).length&&(S.dv.date==="tous"||arrOf(c)===S.dv.date)).map(c=>`<tr><td>${candName(c)}</td><td>${favCats(c).map(k=>`<div class="row" style="gap:8px;margin:2px 0;align-items:center"><b>${esc(k)}</b><label class="note">N° d'autorisation<input data-gnum="${c.id}|${k}|aut" value="${esc(nums(c,k).aut||"")}" placeholder="${esc(autNum(c,k))}" style="width:190px"></label>${c.type==="CACES"?`<label class="note">N° CACES®<input data-gnum="${c.id}|${k}|caces" value="${esc(cacesNum(c,k))}" placeholder="à saisir" style="width:150px"></label>`:""}</div>`).join("")}</td></tr>`).join("");
  const sec=`<section class="panel pad"><div class="eyebrow">Numéros</div><h2 class="xh2">Numéros d'autorisation et de CACES®</h2><p class="note" style="margin-top:0">Le numéro d'autorisation (ACES) est généré automatiquement ; vous pouvez le remplacer. Le numéro de CACES® délivré se saisit ici ; les deux s'impriment sur l'autorisation de conduite.</p>${rows?`<div class="tscroll"><table><thead><tr><th>Personne</th><th>Catégorie(s) réussie(s)</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<p class="note">Aucune autorisation à numéroter pour cette date.</p>'}</section>
  <section class="panel pad"><div class="eyebrow">Qui reçoit quoi</div><h2 class="xh2">Stagiaire, équipe et Drive</h2><p class="note" style="margin-top:0"><b>Équipe</b> (adresses de destination ci-dessus) : tous les documents. <b>Stagiaire</b> (son adresse de la fiche) : uniquement ce qui est coché.</p>
  <div class="row" style="gap:6px;flex-wrap:wrap">${STAG_LAB.map(([k,l])=>`<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-gstag="${k}" ${st[k]?"checked":""}> ${l}</label>`).join("")}</div>
  <label class="f" style="margin-top:10px;max-width:520px">Drive : dossier d'accueil par défaut (identifiant du dossier Google Drive)<input data-xcentre="driveRoot" value="${esc(C.driveRoot||"")}" placeholder="ex. 1AbC…xyz (laisser vide : pas de dépôt Drive)"></label>
  <p class="note">Un sous-dossier « Session AAAA-MM-JJ » puis un dossier par personne sont créés tout seuls. Un dossier propre à une entreprise se renseigne en 6e champ de la liste des entreprises. Le dépôt exige que le connecteur Google Drive soit autorisé pour cette page.</p></section>`;
  const i=h.lastIndexOf('<section class="panel pad"><div class="eyebrow">Envoi automatique</div>');return i>0?h.slice(0,i)+sec+h.slice(i):h+sec;};
app.addEventListener("input",e=>{const t=e.target;if(t.dataset&&t.dataset.gnum){const [id,k,f]=t.dataset.gnum.split("|");setNum(id,k,f,t.value);e.stopImmediatePropagation();}},true);
app.addEventListener("change",e=>{const t=e.target;if(t.dataset&&t.dataset.gstag){S.centre.stag=Object.assign({},STAG_DEF,S.centre.stag||{});S.centre.stag[t.dataset.gstag]=t.checked;saveCentre();e.stopImmediatePropagation();}},true);
