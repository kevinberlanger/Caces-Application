import asyncio,sys,random
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read();H2P=open("/tmp/h2p/node_modules/html2pdf.js/dist/html2pdf.bundle.min.js").read()
R=random.Random(7)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":1280,"height":1000},accept_downloads=True);await ctx.add_init_script(MOCK)
    await ctx.route("https://cdnjs.cloudflare.com/**",lambda r:r.fulfill(body=H2P,content_type="application/javascript"))
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append((str(e),(getattr(e,'stack','') or '')[:400])));pg.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
    await pg.goto(U);await pg.wait_for_timeout(800)
    async def chk(label):
        el=await pg.evaluate("(S.errLog||[]).map(e=>e.kind+': '+e.msg+' @ '+e.where)")
        if el or errs: print("BUG",label,el[:3],errs[:2]);errs.clear();await pg.evaluate("S.errLog=[]")
        else: print("OK ",label)
    await pg.click('[data-act="role"][data-v="admin"]')
    info=await pg.evaluate("""(()=>{const out=[];for(const k of Object.keys(RECOS)){const r=RECOS[k];const cats=(r.cats||[]).map(x=>x[0]);const c=newCand(k);Object.assign(c,{nom:'Test'+k,prenom:'Agent',naissance:'1990-01-01',email:k.toLowerCase()+'@ex.fr',tel:'06',entreprise:'DK',cats:cats.slice(0,3),arrivee:'2026-11-09',depart:'2026-11-12',dateTest:'2026-11-12',statut:'inscrit'});S.cands[c.id]=c;persist(c);out.push([k,c.id,cats.slice(0,3),c.code])}return out})()""")
    await chk("création candidats toutes recommandations")
    for k,cid,cats,code in info:
        await pg.evaluate(f"S.cur='{cid}';S.tab='prat';S.cat='{cats[0]}';render()");await pg.wait_for_timeout(200)
        # clic aléatoire sur chips / steppers
        for i in range(25):
            n=await pg.locator(".chip[aria-pressed], .step button, .sw, .ebtn").count()
            if not n: break
            try: await pg.locator(".chip[aria-pressed], .step button, .sw, .ebtn").nth(R.randrange(n)).click(timeout=800)
            except Exception: pass
        await chk(f"{k} grille pratique ({cats[0]})")
        for cat in cats[1:]:
            await pg.evaluate(f"S.cat='{cat}';render()");await pg.wait_for_timeout(120)
        await chk(f"{k} changement de catégorie")
        # score + décision
        await pg.evaluate(f"(()=>{{const c=S.cands['{cid}'];c.cats.forEach(x=>{{scorePrat(c,x);decisionOf(c,x)}})}})()")
        await chk(f"{k} score + décision")
        # théorie : QCM complet en kiosque
        ok=await pg.evaluate(f"(()=>{{try{{startQuiz('{code}','{k}');S.quiz.kiosk=true;render();return true}}catch(e){{return String(e)}}}})()")
        await pg.wait_for_timeout(300)
        for i in range(120):
            vf=pg.locator(".vf button").first
            if not await vf.count(): 
                go=pg.locator(".qbtn.go, [data-act=qstart], [data-act=qnext]")
                if await go.count():
                    try: await go.first.click(timeout=600)
                    except Exception: break
                else: break
                continue
            try: await pg.locator(".vf button").nth(R.randrange(2)).click(timeout=600)
            except Exception: break
            nx=pg.locator(".qnav .qbtn.go, .qnav button").last
            try: await nx.click(timeout=500)
            except Exception: pass
        await chk(f"{k} QCM kiosque (démarrage {ok})")
        await pg.evaluate("S.quiz=null;S.tab='cand';render()")
        # documents, 3 marques
        r=await pg.evaluate(f"""(()=>{{const c=S.cands['{cid}'];const res=[];for(const mk of ['dkw','dts','kodo','auto']){{S.centre.marque=mk;for(const d of docsOf(c)){{try{{const h=d.build();if(!h||h.length<100)res.push(mk+'/'+d.id+' vide')}}catch(e){{res.push(mk+'/'+d.id+' '+e.message)}}}}}}S.centre.marque='auto';return res}})()""")
        print("OK " if not r else "BUG",f"{k} documents 4 marques",r[:4])
    # onglets avec candidats variés
    for role in ["formateur","testeur","secretariat","admin"]:
        await pg.click(f'[data-act="role"][data-v="{role}"]')
        for tab in ["home","insc","planning","cand","dossier","parcours","theo","prat","suivi","docs","echanges","qual","ref","interv","lib"]:
            await pg.evaluate(f"S.tab='{tab}';render()");await pg.wait_for_timeout(80)
        await chk(f"{role} tous onglets avec 4 candidats")
    await b.close()
asyncio.run(main())
