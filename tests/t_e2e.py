import asyncio,sys,json
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read();H2P=open("/tmp/h2p/node_modules/html2pdf.js/dist/html2pdf.bundle.min.js").read()
PNG="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
SRV="http://127.0.0.1:8794"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    ph=await b.new_context(viewport={"width":390,"height":800});await ph.add_init_script(MOCK)
    await ph.route("https://cdnjs.cloudflare.com/**",lambda r:r.fulfill(body=H2P,content_type="application/javascript"))
    pp=await ph.new_page();perr=[];pp.on("pageerror",lambda e:perr.append(str(e)[:150]))
    await pp.goto(U+"#IFORM17R489");await pp.wait_for_timeout(1000)
    await pp.evaluate(f"__SRV.url='{SRV}'")
    state=await pp.evaluate("!!S.reg")
    print("formulaire ouvert:",state,"étape:",await pp.evaluate("S.reg&&S.reg.stage"))
    await pp.evaluate("""(()=>{const z=S.reg;if(z.stage==='code'||z.stage==='pick'){z.stage='form'}const f=z.f;Object.assign(f,{n:'Dupond',p:'Eric',d:'1988-04-02',e:'eric.dupond@example.com',t:'0611223344',en:'__autre',ena:'Société Test',es:'12345678900012',ead:'1 rue X, Flers',esg:'Jean Chef',po:'Cariste',ch:['Quai de chargement'],nv:'int',xp:'6 mois à 2 ans',cd:'',am:'oui',ad:'non',pf:'initial',ph:'%s',phw:0.9,ok1:true,ok2:true,phl:true});render()})()"""%PNG)
    await pp.wait_for_timeout(300)
    await pp.evaluate("submitReg()");await pp.wait_for_timeout(1500)
    print("après envoi: stage",await pp.evaluate("S.reg.stage"),"sent",await pp.evaluate("S.reg.sent"),"err",await pp.evaluate("S.reg.err"),"code",(await pp.evaluate("(S.reg.result||'').slice(0,12)")))
    print("erreurs page téléphone:",perr)
    # côté personnel
    st=await b.new_context(viewport={"width":1280,"height":900});await st.add_init_script(MOCK)
    await st.route("https://cdnjs.cloudflare.com/**",lambda r:r.fulfill(body=H2P,content_type="application/javascript"))
    sp=await st.new_page();serr=[];sp.on("pageerror",lambda e:serr.append(str(e)[:150]))
    await sp.goto(U);await sp.wait_for_timeout(800)
    await sp.evaluate(f"__SRV.url='{SRV}';localStorage.setItem('caces.srvtoken','tokentokentoken');localStorage.removeItem('caces.srvsince')")
    await sp.click('[data-act="role"][data-v="secretariat"]');await sp.evaluate("S.tab='insc';render()")
    await sp.evaluate("fetchServer(true)");await sp.wait_for_timeout(1500)
    r=await sp.evaluate("""(()=>{const c=Object.values(S.cands).find(x=>x.email==='eric.dupond@example.com');return c?{nom:c.nom,prenom:c.prenom,photo:!!(c.photo&&c.photo.url),fiche:ficheCheck(c),statut:c.statut,source:c.insc&&c.insc.source,srv:__SRV.ok}:null})()""")
    print("candidat importé:",json.dumps(r,ensure_ascii=False)[:300])
    print("pastille:",await sp.evaluate("document.getElementById('netb').innerText.replace(/\\n/g,' ')"))
    # 2e relevé : pas de doublon
    n1=await sp.evaluate("Object.values(S.cands).filter(x=>x.email==='eric.dupond@example.com').length")
    await sp.evaluate("localStorage.removeItem('caces.srvsince');fetchServer(true)");await sp.wait_for_timeout(1000)
    n2=await sp.evaluate("Object.values(S.cands).filter(x=>x.email==='eric.dupond@example.com').length")
    print("doublon après 2e relevé:",n1,"->",n2)
    # mauvais jeton
    await sp.evaluate("localStorage.setItem('caces.srvtoken','faux');fetchServer(true)");await sp.wait_for_timeout(800)
    print("mauvais jeton:",await sp.evaluate("__SRV.ok+' / '+__SRV.err"))
    # serveur coupé
    await sp.evaluate("localStorage.setItem('caces.srvtoken','tokentokentoken');__SRV.url='http://127.0.0.1:8793';fetchServer(true)");await sp.wait_for_timeout(1500)
    print("serveur coupé:",await sp.evaluate("__SRV.ok+' / '+__SRV.err"),"| pastille:",await sp.evaluate("document.getElementById('netb').innerText.replace(/\\n/g,' ')"))
    print("erreurs page personnel:",serr)
    await b.close()
asyncio.run(main())
