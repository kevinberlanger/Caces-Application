import asyncio,sys
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":1280,"height":1500});await ctx.add_init_script(MOCK)
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.goto(U);await pg.wait_for_timeout(900)
    await pg.click('[data-act="role"][data-v="secretariat"]')
    await pg.evaluate("""(()=>{const mk=(e,n,p)=>({c:'ZZ'+n,r:'R489',n,p,d:'1990-01-01',e,t:'0600000000',en:'DK',po:'Cariste',ch:['Autre'],nv:'deb',xp:'Aucune',am:'oui',ad:'non',ts:new Date().toISOString()});
      ['Alpha','Beta','Gamma'].forEach((n,i)=>importOne(mk(n.toLowerCase()+'@ex.fr',n,'P'+i),'code'));S.tab='insc';render();})()""")
    await pg.wait_for_timeout(500)
    sel=lambda:pg.evaluate("document.querySelectorAll('[data-rqsel]:checked').length")
    lab=lambda:pg.evaluate("document.querySelector('[data-act=qb_rqall]').innerText")
    print("lib 1:",await lab(),await sel())
    await pg.locator("[data-act='qb_rqall']").first.click();await pg.wait_for_timeout(300);print("après:",await lab(),await sel())
    await pg.locator("[data-act='qb_rqall']").first.click();await pg.wait_for_timeout(300);print("re-clic:",await lab(),await sel())
    # sélection de 2 fiches hors liste puis suppression groupée
    await pg.locator("div[data-cid] input[data-rqsel]").nth(0).check();await pg.locator("div[data-cid] input[data-rqsel]").nth(1).check();await pg.wait_for_timeout(300)
    print("sél:",await sel(),"boutons:",await pg.evaluate("[...document.querySelectorAll('.confirm button')].map(x=>x.dataset.act)"))
    await pg.locator("[data-act='qb_rqbcand']").first.click();await pg.wait_for_timeout(300)
    print("confirmation:",await pg.evaluate("[...document.querySelectorAll('.confirm button')].map(x=>x.dataset.act+':'+x.innerText)"))
    await pg.locator("[data-act='qb_rqbok']").first.click();await pg.wait_for_timeout(500)
    print("restants:",await pg.evaluate("Object.values(S.cands).filter(c=>c.id!=='exemple').map(c=>c.nom)"),"errs",errs)
    await b.close()
asyncio.run(main())
