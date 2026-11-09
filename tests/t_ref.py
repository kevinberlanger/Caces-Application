import asyncio,sys
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":1280,"height":900});await ctx.add_init_script(MOCK)
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append((str(e),(getattr(e,'stack','') or '')[:500])))
    await pg.goto(U);await pg.wait_for_timeout(800)
    await pg.evaluate("S.tab='ref';S.refView='home';render()");await pg.wait_for_timeout(300)
    n=await pg.locator("[data-act=refopen]").count();print("boutons refopen",n)
    for i in range(n):
        await pg.evaluate("S.tab='ref';S.refView='home';render()")
        before=len(errs)
        el=pg.locator("[data-act=refopen]").nth(i);d=await el.evaluate("e=>e.dataset.r+'/'+e.dataset.v+'/'+(e.dataset.c||'')")
        await el.click();await pg.wait_for_timeout(120)
        if len(errs)>before: print("ERREUR sur",d,errs[-1][0],"\n",errs[-1][1])
    print("total erreurs",len(errs));await b.close()
asyncio.run(main())
