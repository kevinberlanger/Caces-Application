import asyncio,sys
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":1280,"height":900});await ctx.add_init_script(MOCK)
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)[:150]))
    await pg.goto(U);await pg.wait_for_timeout(900)
    await pg.click('[data-act="role"][data-v="secretariat"]');await pg.evaluate("S.tab='insc';render()");await pg.wait_for_timeout(300)
    print("claude.mcp présent:",await pg.evaluate("!!S.mcp"))
    # invitations
    await pg.evaluate("""(()=>{S.inv.emails='a1@ex.fr, b1@ex.fr\\n c1@ex.fr';S.inv.cats=['1A'];S.inv.date='2026-11-17';render()})()""")
    btn=pg.locator("[data-act=sendinv], [data-act=invsend], button:has-text('Envoyer')").first
    names=await pg.evaluate("[...document.querySelectorAll('[data-act]')].map(e=>e.dataset.act).filter(a=>/inv|send/i.test(a))")
    print("actions envoi:",sorted(set(names))[:10])
    await pg.evaluate("sendInvites()");await pg.wait_for_timeout(1500)
    print("mails partis:",await pg.evaluate("__mails.length"),"| sujets:",await pg.evaluate("[...new Set(__mails.map(m=>m.subject))].slice(0,2)"),"| contient lien:",await pg.evaluate("__mails.every(m=>/https?:\\/\\//.test(m.body||''))"))
    print("candidats invités:",await pg.evaluate("Object.values(S.cands).filter(c=>c.statut==='invite').map(c=>c.email)"))
    print("doublon code dans le mail:",await pg.evaluate("__mails.some(m=>/code d'inscription/i.test(m.body||''))"))
    # hors connexion : mise en file puis envoi au retour
    n0=await pg.evaluate("__mails.length")
    await ctx.set_offline(True);await pg.evaluate("window.__off=true;window.dispatchEvent(new Event('offline'))")
    await pg.evaluate("""(()=>{S.inv.emails='d1@ex.fr';render()})()""");await pg.evaluate("sendInvites()");await pg.wait_for_timeout(1200)
    print("hors ligne: file d'attente",await pg.evaluate("OFF.q.length"),"mails partis",await pg.evaluate("__mails.length")-n0)
    await ctx.set_offline(False);await pg.evaluate("window.__off=false;window.dispatchEvent(new Event('online'))");await pg.wait_for_timeout(2500)
    print("retour réseau: file",await pg.evaluate("OFF.q.length"),"mails partis",await pg.evaluate("__mails.length")-n0)
    print("erreurs",errs,await pg.evaluate("(S.errLog||[]).map(e=>e.msg)"))
    await b.close()
asyncio.run(main())
