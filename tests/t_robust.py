import asyncio,sys,time
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read();H2P=open("/tmp/h2p/node_modules/html2pdf.js/dist/html2pdf.bundle.min.js").read()
async def run(name,init=None,hash="",post=None):
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":390,"height":800});await ctx.add_init_script(MOCK)
    await ctx.route("https://cdnjs.cloudflare.com/**",lambda r:r.fulfill(body=H2P,content_type="application/javascript"))
    if init: await ctx.add_init_script(init)
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)[:150]))
    t=time.time()
    try:
        await pg.goto(U+hash);await pg.wait_for_timeout(1200)
        if post: await pg.evaluate(post);await pg.wait_for_timeout(600)
        txt=await pg.evaluate("document.body.innerText.length");el=await pg.evaluate("(window.S&&S.errLog||[]).map(e=>e.msg)")
        print(("OK  " if not errs and not el and txt>50 else "BUG "),name,f"{time.time()-t:.1f}s","texte",txt,errs[:2],el[:2])
    except Exception as e: print("BUG ",name,str(e)[:150])
    await b.close()
async def main():
  await run("démarrage normal")
  await run("hash inconnu",hash="#zzz")
  await run("hash #IFORM17R489",hash="#IFORM17R489")
  await run("hash #I vide",hash="#I")
  await run("hash #S (session) sans code",hash="#SABCDEFR489")
  await run("hash #Q (qcm) code inconnu",hash="#QABCDEFR489")
  await run("hash très long",hash="#I"+"A"*5000)
  await run("hash injection",hash="#I<script>alert(1)</script>")
  await run("localStorage mockstore corrompu",init="localStorage.setItem('mockstore','{pas du json');")
  await run("localStorage miroir corrompu",init="['caces.mirror','caces.q','caces.offq','caces.role','caces.compact'].forEach(k=>localStorage.setItem(k,'{{{'));")
  await run("rôle inconnu",init="localStorage.setItem('caces.role','pirate');")
  await run("1000 candidats (perf)",post="(()=>{for(let i=0;i<1000;i++){const c=newCand('R489');Object.assign(c,{nom:'N'+i,prenom:'P'+i,email:'e'+i+'@x.fr',cats:['1A'],statut:'inscrit'});S.cands[c.id]=c}S.role='admin';S.tab='cand';render()})()")
  await run("1000 candidats onglet insc",post="(()=>{for(let i=0;i<1000;i++){const c=newCand('R489');Object.assign(c,{nom:'N'+i,prenom:'P'+i,email:'e'+i+'@x.fr',cats:['1A'],statut:'inscrit',insc:{certifieLe:'2026-01-01'}});S.cands[c.id]=c}S.role='secretariat';S.tab='insc';render()})()")
  await run("candidat sans champs (données minimales)",post="(()=>{const c={id:'zz1',code:'ZZZZZZ',reco:'R489'};S.cands.zz1=c;S.role='admin';['cand','dossier','parcours','theo','prat','suivi','docs','insc'].forEach(t=>{S.cur='zz1';S.tab=t;render()})})()")
  await run("candidat reco invalide",post="(()=>{const c={id:'zz2',code:'ZZZZZZ',reco:'XXX',cats:['9']};S.cands.zz2=c;S.role='admin';S.cur='zz2';['cand','prat','docs'].forEach(t=>{S.tab=t;render()})})()")
asyncio.run(main())
