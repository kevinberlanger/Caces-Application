import asyncio,sys
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":390,"height":800});await ctx.add_init_script(MOCK)
    pg=await ctx.new_page();await pg.goto(U);await pg.wait_for_timeout(800)
    await pg.evaluate("(()=>{const c=newCand('R489');Object.assign(c,{nom:'Martin',prenom:'Lucas',cats:['1A'],statut:'inscrit'});S.cands[c.id]=c;S.cur=c.id})()")
    await pg.click('[data-act="role"][data-v="admin"]');await pg.evaluate("S.tab='insc';render()");await pg.wait_for_timeout(300)
    r=await pg.evaluate("""(()=>{const out=[];document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.right>innerWidth+2&&r.width>0&&!e.closest('.tscroll,.tabs'))out.push([e.tagName+'.'+(e.className||'')+(e.id?'#'+e.id:''),Math.round(r.width),Math.round(r.right),(e.innerText||'').slice(0,30).replace(/\\n/g,' ')])});return out.slice(0,14)})()""")
    for x in r: print(x)
    await b.close()
asyncio.run(main())
