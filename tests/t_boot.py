import asyncio,sys
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":1280,"height":900});await ctx.add_init_script(MOCK)
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append((str(e),(getattr(e,'stack','') or '')[:600])))
    await pg.goto(U);await pg.wait_for_timeout(800)
    for role in ["formateur","testeur","secretariat","admin"]:
        await pg.click(f'[data-act="role"][data-v="{role}"]');await pg.wait_for_timeout(200)
        for tab in ["home","insc","planning","cand","dossier","parcours","theo","prat","suivi","docs","echanges","qual","ref","interv","lib"]:
            before=len(errs)
            try:
                await pg.evaluate(f"S.tab='{tab}';render()");await pg.wait_for_timeout(120)
            except Exception as e: print("evaluate",role,tab,str(e)[:100])
            if len(errs)>before: print("ERREUR",role,tab,errs[-1][0],"\n   ",errs[-1][1].replace("\n"," | ")[:400])
            el=await pg.evaluate("(S.errLog||[]).length")
            if el: print("errLog",role,tab,await pg.evaluate("JSON.stringify(S.errLog.slice(-2))"));await pg.evaluate("S.errLog=[]")
    print("avant redémarrage errLog:",await pg.evaluate("typeof S.errLog"))
    await pg.evaluate("softReboot(false)");await pg.wait_for_timeout(500)
    print("après redémarrage errLog:",await pg.evaluate("typeof S.errLog"),"erreurs:",errs[-2:])
    await b.close()
asyncio.run(main())
