import asyncio,sys,json
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read()
H2P=open("/tmp/h2p/node_modules/html2pdf.js/dist/html2pdf.bundle.min.js").read()
R=[]
def ck(n,ok,d=""):R.append((n,bool(ok),str(d)[:200]));print(("OK  " if ok else "BUG ")+n,d if not ok else "")
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":390,"height":800});await ctx.add_init_script(MOCK)
    await ctx.route("https://cdnjs.cloudflare.com/**",lambda r:r.fulfill(body=H2P,content_type="application/javascript"))
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.goto(U);await pg.wait_for_timeout(800)
    ck("T1 chargement sans erreur JS",not errs,errs)
    await pg.click('[data-act="role"][data-v="secretariat"]')
    ck("T2 rôle secrétariat",await pg.evaluate("S.role==='secretariat'"))
    # T3 aller-retour code
    r=await pg.evaluate("""(()=>{const o={c:'ABC123',r:'R489',n:'Durand',p:'Paul',d:'1985-05-02',e:'paul@ex.fr',t:'0611223344',en:'DK Working',po:'Cariste',ch:['Quai de chargement'],nv:'int',xp:'Aucune',am:'oui',ad:'non',ts:new Date().toISOString()};
      const code=encodeInsc(o);const back=decodeInscAll('Bonjour\\n> '+code.slice(0,30)+'\\n> '+code.slice(30)+'\\nMerci');return {n:back.length,e:back[0]&&back[0].e}})()""")
    ck("T3 code INSC encodé/décodé (même coupé en lignes)",r["n"]==1 and r["e"]=="paul@ex.fr",r)
    # T4 import + contrôle
    r=await pg.evaluate("""(()=>{const mk=(e,n,p)=>({c:'ZZZ999',r:'R489',n,p,d:'1990-01-01',e,t:'0600000000',en:'DK',po:'Cariste',ch:['Atelier de production'],nv:'deb',xp:'Aucune',am:'oui',ad:'non',ts:new Date().toISOString()});
      const a=importOne(mk('a@ex.fr','Alpha','Anne'),'code'),b=importOne(mk('b@ex.fr','Beta','Bob'),'code');
      return {same:a&&b&&a.id===b.id,na:a&&a.nom,nb:b&&b.nom,ca:a&&ficheCheck(a),total:Object.keys(S.cands).length}})()""")
    ck("T4 deux stagiaires = deux fiches distinctes",r and not r["same"] and r["na"]=="Alpha" and r["nb"]=="Beta",r)
    ck("T5 contrôle fiche renvoie ok/e",r and r["ca"] and "ok" in r["ca"],r and r.get("ca"))
    # T6 doublon même mail
    r=await pg.evaluate("""(()=>{const n0=Object.keys(S.cands).length;const o={c:'ZZZ999',r:'R489',n:'Alpha',p:'Anne',d:'1990-01-01',e:'a@ex.fr',t:'0600000000',en:'DK',po:'Cariste',ch:['Autre'],nv:'deb',xp:'Aucune',am:'oui',ad:'non',ts:new Date(Date.now()+5000).toISOString()};importOne(o,'code');return Object.keys(S.cands).length-n0})()""")
    ck("T6 renvoi même mail ne duplique pas",r==0,r)
    # T7 n° de session
    r=await pg.evaluate("""(()=>{const c=Object.values(S.cands)[0];c.arrivee='2026-11-17';return sessNum(c)})()""")
    ck("T7 n° de session auto",r=="R489-20261117",r)
    # T8 vue insc / panneau retours
    await pg.evaluate("S.tab='insc';render()");await pg.wait_for_timeout(300)
    h=await pg.evaluate("document.body.innerText")
    ck("T8 onglet inscriptions affiche les stagiaires",("Alpha" in h or "ALPHA" in h.upper()) and "Retours" in h,h[:120])
    # T9 formulaire public
    pg2=await ctx.new_page();e2=[];pg2.on("pageerror",lambda e:e2.append(str(e)))
    await pg2.goto(U+"#IFORM17R489");await pg2.wait_for_timeout(900)
    t=await pg2.evaluate("document.body.innerText")
    ck("T9 formulaire public s'ouvre",("nom" in t.lower() or "prénom" in t.lower()) and not e2,(e2,t[:100]))
    inputs=await pg2.evaluate("document.querySelectorAll('input,select,textarea').length")
    ck("T10 formulaire a des champs",inputs>=5,inputs)
    # T11 envoi fiche (mode code ou serveur) sans plantage
    try:
      await pg2.evaluate("""(()=>{const s=(k,v)=>{const el=document.querySelector('[data-xreg="'+k+'"]');if(el){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}};
        s('nom','Test');s('prenom','Agent');s('email','agent@ex.fr');s('tel','0600000000')})()""")
    except Exception as e: pass
    ck("T11 formulaire: pas d'erreur JS après saisie",not e2,e2)
    # T12 reboot hors-ligne
    await pg.evaluate("window.__off=true");await pg.evaluate("persist(Object.values(S.cands)[0])")
    ck("T12 persist hors-ligne sans erreur JS",not errs,errs)
    await pg.evaluate("window.__off=false")
    # T13 docs
    r=await pg.evaluate("""(()=>{try{const c=Object.values(S.cands)[0];const l=docsOf(c);return l.map(d=>{const h=d.build();return h&&h.length>200?1:0}).join('')}catch(e){return 'ERR '+e.message}})()""")
    ck("T13 documents se construisent",r and not str(r).startswith("ERR"),r)
    # T14 package
    r=await pg.evaluate("typeof (window.downloadPackage||window.dlPackage||window.packageZip)")
    print("info package fn:",r)
    ck("T15 aucune erreur JS globale",not errs and not e2,errs+e2)
    await b.close()
    bad=[x for x in R if not x[1]]
    print("RESULT",len(R)-len(bad),"/",len(R),"bugs:",[x[0] for x in bad])
asyncio.run(main())
