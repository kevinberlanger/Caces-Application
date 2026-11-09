import asyncio,sys
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":390,"height":800});await ctx.add_init_script(MOCK)
    pg=await ctx.new_page();await pg.goto(U);await pg.wait_for_timeout(800)
    await pg.evaluate("""(()=>{const c=newCand('R489');Object.assign(c,{nom:'Martin',prenom:'Lucas',cats:['1A'],statut:'inscrit'});S.cands[c.id]=c;S.cur=c.id})()""")
    res={}
    for role in ["admin","secretariat","testeur"]:
      await pg.click(f'[data-act="role"][data-v="{role}"]')
      for tab in ["home","insc","cand","prat","theo","docs"]:
        await pg.evaluate(f"S.tab='{tab}';render()");await pg.wait_for_timeout(80)
        r=await pg.evaluate("""(()=>{const bad=[];document.querySelectorAll('button,[data-act]').forEach(e=>{const r=e.getBoundingClientRect();if(r.width<=0||r.height<=0)return;const s=getComputedStyle(e);if(s.visibility==='hidden')return;const t=(e.innerText||e.getAttribute('aria-label')||e.title||'').trim();if(!t)bad.push('sans libellé:'+(e.dataset.act||e.className));if((r.height<30||r.width<30)&&t&&!e.closest('.tscroll')&&e.tagName==='BUTTON')bad.push('petite cible '+Math.round(r.width)+'x'+Math.round(r.height)+':'+t.slice(0,15))});
          const inputs=[...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]),select,textarea')].filter(e=>e.getBoundingClientRect().width>0&&!e.labels?.length&&!e.getAttribute('aria-label')&&!e.placeholder&&!e.closest('label'));inputs.forEach(e=>bad.push('champ sans étiquette:'+(e.dataset&&Object.keys(e.dataset)[0]||e.id||e.type)));return [...new Set(bad)].slice(0,6)})()""")
        for x in r: res.setdefault(x,set()).add(f"{role}/{tab}")
    for k,v in sorted(res.items()): print(k,"|",sorted(v)[:3])
    print("total problèmes distincts:",len(res));await b.close()
asyncio.run(main())
