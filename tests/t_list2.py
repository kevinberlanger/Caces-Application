import asyncio,sys
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":1280,"height":1500});await ctx.add_init_script(MOCK)
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.goto(U);await pg.wait_for_timeout(900)
    await pg.click('[data-act="role"][data-v="secretariat"]')
    await pg.evaluate("""(()=>{const mk=(e,n,p)=>({c:'ZZ'+n,r:'R489',n,p,d:'1990-01-01',e,t:'0600000000',en:'DK',po:'Cariste',ch:['Atelier de production'],nv:'deb',xp:'Aucune',am:'oui',ad:'non',ts:new Date().toISOString()});
      importOne(mk('a@ex.fr','Alpha','Anne'),'code');importOne(mk('b@ex.fr','Beta','Bob'),'code');S.tab='insc';render();})()""")
    await pg.wait_for_timeout(500)
    cnt=lambda:pg.evaluate("[document.querySelectorAll('[data-rqrow] input[type=checkbox]').length,[...document.querySelectorAll('[data-rqrow] input[type=checkbox]')].filter(x=>x.checked).length]")
    print("avant",await cnt())
    await pg.get_by_text("Tout sélectionner").first.click();await pg.wait_for_timeout(400)
    print("après tout sél.",await cnt(), "bouton:",await pg.evaluate("[...document.querySelectorAll('[data-act=qb_rqall]')].map(x=>x.innerText)"))
    await pg.locator("[data-act='qb_rqall']").first.click();await pg.wait_for_timeout(400)
    print("après 2e clic",await cnt())
    # cocher une case
    await pg.locator("[data-rqrow] input[type=checkbox]").nth(1).check();await pg.wait_for_timeout(300)
    print("après 1 case",await cnt(),"barre:",await pg.evaluate("[...document.querySelectorAll('[data-act^=qb_rqb]')].map(x=>x.dataset.act+':'+x.innerText)"))
    # croix
    n0=await pg.evaluate("document.querySelectorAll('[data-rqrow]').length")
    await pg.locator("[data-act='qb_rqx']").first.click();await pg.wait_for_timeout(400)
    print("confirm:",await pg.evaluate("[...document.querySelectorAll('.confirm button')].map(x=>x.dataset.act+':'+x.innerText)"))
    await pg.locator("[data-act='qb_rqlist']").first.click();await pg.wait_for_timeout(600)
    n1=await pg.evaluate("document.querySelectorAll('[data-rqrow]').length")
    print("lignes",n0,"->",n1,"confirm restant:",await pg.locator('.confirm').count())
    # supprimer fiche hors liste
    await pg.locator("div[data-cid] [data-act='qb_rqx']").first.click();await pg.wait_for_timeout(400)
    print("confirm2:",await pg.evaluate("[...document.querySelectorAll('.confirm button')].map(x=>x.dataset.act+':'+x.innerText)"))
    await pg.locator("[data-act='qb_rqcand']").first.click();await pg.wait_for_timeout(600)
    print("cands restants:",await pg.evaluate("Object.values(S.cands).filter(c=>c.id!=='exemple').map(c=>c.nom)"))
    print("errs",errs);await b.close()
asyncio.run(main())
