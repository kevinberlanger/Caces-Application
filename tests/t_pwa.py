import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":390,"height":800},service_workers="allow")
    await ctx.route("https://**/*",lambda r:r.abort())
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)[:150]))
    await pg.goto("http://127.0.0.1:8792/");await pg.wait_for_timeout(2500)
    print("sw actif:",await pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>!!(r&&r.active))"))
    print("manifest:",await pg.evaluate("document.querySelector('link[rel=manifest]')&&document.querySelector('link[rel=manifest]').href"))
    await ctx.set_offline(True)
    await pg.reload();await pg.wait_for_timeout(1500)
    print("rechargé hors ligne, texte:",await pg.evaluate("document.body.innerText.length"),"indicateur:",await pg.evaluate("(document.getElementById('netb')||{}).innerText"))
    await pg.goto("http://127.0.0.1:8792/#IFORM17R489");await pg.wait_for_timeout(1200)
    print("formulaire hors ligne:",await pg.evaluate("document.body.innerText.length"))
    print("erreurs:",errs);await b.close()
asyncio.run(main())
