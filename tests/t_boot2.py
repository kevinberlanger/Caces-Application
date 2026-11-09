import asyncio,sys
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":1280,"height":900});await ctx.add_init_script(MOCK)
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.goto(U);await pg.wait_for_timeout(800)
    k1=await pg.evaluate("Object.keys(S)");await pg.evaluate("softReboot(false)");await pg.wait_for_timeout(600)
    k2=await pg.evaluate("Object.keys(S)")
    print("perdues au redémarrage:",sorted(set(k1)-set(k2)));print("nouvelles:",sorted(set(k2)-set(k1)));print("errs",errs)
    await pg.evaluate("S.role='secretariat';S.tab='insc';render()");await pg.wait_for_timeout(400);print("errs après insc",errs)
    await b.close()
asyncio.run(main())
