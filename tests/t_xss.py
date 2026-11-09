import asyncio,sys
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read();H2P=open("/tmp/h2p/node_modules/html2pdf.js/dist/html2pdf.bundle.min.js").read()
X='<img src=x onerror="window.__xss=(window.__xss||0)+1">'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":1280,"height":900});await ctx.add_init_script(MOCK)
    await ctx.route("https://cdnjs.cloudflare.com/**",lambda r:r.fulfill(body=H2P,content_type="application/javascript"))
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)[:150]))
    await pg.goto(U);await pg.wait_for_timeout(800)
    await pg.click('[data-act="role"][data-v="admin"]')
    await pg.evaluate("""(X)=>{const o={c:'XSS001',r:'R489',n:X,p:X,d:'1990-01-01',e:'x@ex.fr',t:X,en:X,po:X,ch:[X],ca:X,nv:'deb',xp:X,cd:X,am:'oui',ad:'non',emp:{nom:X,siret:X,adr:X,sg:X},ts:new Date().toISOString()};
      const c=importOne(o,'serveur');c.cats=['1A'];c.photo={url:'data:image/png;base64,AAAA',white:1};S.cur=c.id;window.__cid=c.id;persist(c)}""",X)
    for role in ["admin","formateur","testeur","secretariat"]:
        await pg.click(f'[data-act="role"][data-v="{role}"]')
        for tab in ["home","insc","planning","cand","dossier","parcours","theo","prat","suivi","docs","echanges","qual","ref","interv","lib"]:
            await pg.evaluate(f"S.cur=__cid;S.tab='{tab}';render()");await pg.wait_for_timeout(60)
    await pg.wait_for_timeout(500)
    print("XSS dans l'interface:",await pg.evaluate("window.__xss||0"))
    # documents : HTML produit, rendu dans une page neutre
    htmls=await pg.evaluate("(()=>{const c=S.cands[__cid];const out=[];for(const mk of ['dkw','dts','kodo']){S.centre.marque=mk;for(const d of docsOf(c)){try{out.push([mk+'/'+d.id,d.build()])}catch(e){}}}return out})()")
    p2=await ctx.new_page();p2.on("pageerror",lambda e:None)
    bad=[]
    for k,h in htmls:
        await p2.set_content(h);await p2.wait_for_timeout(40)
        if await p2.evaluate("window.__xss||0"): bad.append(k)
        if X in h: bad.append(k+"(brut)")
    print("documents testés:",len(htmls),"| XSS dans documents:",bad[:6])
    # QR/lien d'invitation & mail corps
    print("erreurs",errs)
    await b.close()
asyncio.run(main())
