import asyncio,sys
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w in (360,390,768):
      ctx=await b.new_context(viewport={"width":w,"height":800});await ctx.add_init_script(MOCK)
      pg=await ctx.new_page();await pg.goto(U);await pg.wait_for_timeout(800)
      await pg.evaluate("""(()=>{const mk=(e,n,p)=>({c:'LY'+n,r:'R489',n,p,d:'1990-01-01',e,t:'0600000000',en:'DK',po:'Cariste',ch:['Autre'],nv:'deb',xp:'Aucune',am:'oui',ad:'non',ts:new Date().toISOString()});importOne(mk('a@ex.fr','Alpha','Anne'),'code');const c=newCand('R489');Object.assign(c,{nom:'Martin',prenom:'Lucas',cats:['1A'],statut:'inscrit'});S.cands[c.id]=c;S.cur=c.id})()""")
      bad=[]
      for role in ["admin","formateur","testeur","secretariat"]:
        await pg.click(f'[data-act="role"][data-v="{role}"]')
        for tab in ["home","insc","planning","cand","dossier","parcours","theo","prat","suivi","docs","echanges","qual","ref","interv","lib"]:
            await pg.evaluate(f"S.tab='{tab}';render()");await pg.wait_for_timeout(70)
            o=await pg.evaluate("(()=>{const d=document.documentElement;const over=d.scrollWidth-innerWidth;if(over<=2)return null;let w=[];document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.right>innerWidth+2&&r.width>0&&getComputedStyle(e).position!=='fixed'&&!e.closest('.tscroll,.tabs,pre'))w.push((e.className||e.tagName)+'')});return {over,w:[...new Set(w)].slice(0,3)}})()")
            if o: bad.append((role,tab,o))
      seen=set();print(f"largeur {w}px:",len(bad),"débordements")
      for r,t,o in bad:
        k=(t,o['over']//10)
        if k in seen: continue
        seen.add(k);print("  ",r,t,o)
      await ctx.close()
    await b.close()
asyncio.run(main())
