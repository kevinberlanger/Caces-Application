import asyncio,sys
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":1280,"height":900});await ctx.add_init_script(MOCK)
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.goto(U);await pg.wait_for_timeout(900)
    print("diagbtn",await pg.locator('#diagbtn').count(),"assistant",await pg.evaluate("!!document.querySelector('#cl-set,#cl-open,[id^=cl-]')"))
    await pg.click('[data-act="role"][data-v="secretariat"]')
    await pg.evaluate("S.tab='insc';render()");await pg.wait_for_timeout(400)
    t=await pg.evaluate("document.body.innerText+document.body.innerHTML")
    print("jeton champ:", "Jeton du serveur" in t, "| package:", "Télécharger le package" in t, "| contrôle:", "Retours des stagiaires" in t)
    print("data-cid rows:",await pg.evaluate("document.querySelectorAll('[data-cid]').length"),"| boutons suppr:",await pg.evaluate("[...document.querySelectorAll('[data-act]')].map(e=>e.dataset.act).filter(a=>/qb_|rqx|del|rm|clr/.test(a)).slice(0,8)"))
    await pg.click('#diagbtn');await pg.wait_for_timeout(300)
    print("diag ouvert:", "Diagnostic" in await pg.evaluate("document.body.innerText"))
    print("errs",errs)
    await b.close()
asyncio.run(main())
