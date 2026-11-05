s=open('v50/index.html',encoding='utf-8').read()
def rep(o,n,cnt=1):
    global s
    assert s.count(o)==cnt,(o[:70],s.count(o)); s=s.replace(o,n)
rep('Votre ${d.label.toLowerCase()} — ${periodTxt(c)}','Votre document — ${d.label} — ${periodTxt(c)}')
rep('const docDestsFor=c=>[...new Set([...docDests(),...splitMail((entFind(c&&c.entreprise)||{}).mail)])];',
'''const personMails=c=>[c&&c.formateurId,c&&c.testeurId].map(id=>S.interv[id]).filter(x=>x&&x.mine!==false&&okMail(x.email)).map(x=>x.email.trim());
const docDestsFor=c=>[...new Set([...docDests(),...splitMail((entFind(c&&c.entreprise)||{}).mail),...personMails(c)])];
S.me=S.me||{email:(function(){try{return localStorage.getItem("caces.myemail")||""}catch(e){return ""}})(),src:""};
const myInterv=()=>{const m=(S.me.email||"").trim().toLowerCase();return m?intList().find(x=>(x.email||"").trim().toLowerCase()===m)||null:null;};
(async()=>{try{const u=window.claude&&await window.claude.use("user");const p=u&&await u.me();if(p&&p.email){S.me.email=p.email;S.me.src="login";if(!S.quiz&&!S.reg)render();}}catch(e){}})();''')
rep('for(const c of Object.values(S.cands)){if(c.id==="exemple")continue;for(const d of docsOf(c)){if(!d.auto||String(d.at||"")<(C.autoSince||"9999"))continue;\n      const sent=',
'for(const c of Object.values(S.cands)){if(c.id==="exemple")continue;{const mi=myInterv();if(mi&&mi.mine!==false&&c.formateurId!==mi.id&&c.testeurId!==mi.id)continue;}for(const d of docsOf(c)){if(!d.auto||String(d.at||"")<(C.autoSince||"9999"))continue;\n      const sent=')
rep('''/* =========================================================================
   ÉVÉNEMENTS''','''const _viewInterv0=viewInterv;
viewInterv=function(){const mi=myInterv(),m=S.me.email||"";
  const p=`<section class="panel pad" style="margin-bottom:14px"><div class="eyebrow">Mon profil d'envoi</div><h2 class="xh2">Je me connecte avec mon mail</h2>
  <p class="note" style="margin-top:0">${S.me.src==="login"?"Identifié par votre connexion.":"Saisissez votre adresse mail pour vous identifier."} Les documents sont envoyés depuis <b>votre</b> boîte Gmail (celle connectée à cette page) et uniquement pour <b>vos</b> candidats (ceux où vous êtes formateur ou testeur). Votre adresse reçoit aussi une copie.</p>
  <div class="row"><label class="f" style="min-width:260px">Mon adresse mail<input type="email" data-gme="1" value="${esc(m)}" placeholder="prenom.nom@entreprise.fr"></label>
  ${mi?`<span class="pill ok">Fiche : ${esc(intName(mi))}</span><label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-gmine="${mi.id}" ${mi.mine!==false?"checked":""}> Envoyer / recevoir les documents de mes candidats depuis mon mail</label>`:m?`<span class="pill warn">Aucune fiche intervenant avec cette adresse</span><button class="btn pri" data-act="gmecreate">Créer ma fiche</button>`:""}</div></section>`;
  return p+_viewInterv0();};
app.addEventListener("input",e=>{const t=e.target;if(t.dataset&&t.dataset.gme){S.me.email=t.value.trim();S.me.src="manuel";try{localStorage.setItem("caces.myemail",S.me.email)}catch(x){}e.stopImmediatePropagation();}},true);
app.addEventListener("change",e=>{const t=e.target;if(t.dataset&&t.dataset.gme){render();e.stopImmediatePropagation();}else if(t.dataset&&t.dataset.gmine){const x=S.interv[t.dataset.gmine];if(x){x.mine=t.checked;saveInterv(x);}e.stopImmediatePropagation();}},true);
app.addEventListener("click",e=>{const b=e.target.closest('[data-act="gmecreate"]');if(!b)return;const x={id:"i"+Date.now().toString(36),nom:"",prenom:"",roles:["formateur","testeur"],recos:[],cats:{},email:S.me.email,tel:"",org:"",valid:"",note:"",mine:true};S.iedit=x.id;saveInterv(x);e.stopImmediatePropagation();render();},true);

/* =========================================================================
   ÉVÉNEMENTS''')
s=s.replace('const BOOT_KEEP=new Set(["gx"','const BOOT_KEEP=new Set(["me","gx"')
open('v51/index.html','w',encoding='utf-8').write(s)
