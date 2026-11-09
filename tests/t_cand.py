import asyncio,sys
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":1280,"height":900});await ctx.add_init_script(MOCK)
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)[:150]))
    await pg.goto(U);await pg.wait_for_timeout(800)
    await pg.click('[data-act="role"][data-v="testeur"]')
    await pg.click('[data-act="candmode"]');await pg.wait_for_timeout(400)
    t=await pg.evaluate("document.body.innerText.length");print("mode candidat: texte",t,"quiz:",await pg.evaluate("JSON.stringify(S.quiz&&{stage:S.quiz.stage,kiosk:S.quiz.kiosk})"))
    for code in ["","ZZZZZZ","a","<b>","123456"]:
        await pg.evaluate("document.querySelectorAll('.codein')[0]&&(document.querySelectorAll('.codein')[0].value='')")
        if await pg.locator(".codein").count():
            await pg.fill(".codein",code)
        if await pg.locator("[data-act=qcodeok]").count(): await pg.click("[data-act=qcodeok]")
        await pg.wait_for_timeout(300)
        print("code",repr(code),"texte",await pg.evaluate("document.body.innerText.length"),"stage",await pg.evaluate("S.quiz&&S.quiz.stage"),"msg",(await pg.evaluate("(document.querySelector('.rerr')||{}).innerText||''"))[:60])
    print("errs",errs,"errLog",await pg.evaluate("(S.errLog||[]).map(e=>e.msg)"))
    await b.close()
asyncio.run(main())
