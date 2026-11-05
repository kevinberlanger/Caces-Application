import asyncio,sys,json,base64
from playwright.async_api import async_playwright
U="file://"+sys.argv[1];MOCK=open("mock.js").read()
H2P=open("/tmp/h2p/node_modules/html2pdf.js/dist/html2pdf.bundle.min.js").read()
SIG="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAAUElEQVR4nO3PAQ0AAAjAIO1fWjPGDEhwexyVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVAiVsxsQqQABfXVbkgAAAABJRU5ErkJggg=="
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":1280,"height":900},accept_downloads=True);await ctx.add_init_script(MOCK)
    await ctx.route("https://cdnjs.cloudflare.com/**",lambda r:r.fulfill(body=H2P,content_type="application/javascript"))
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.goto(U);await pg.wait_for_timeout(800)
    await pg.click('[data-act="role"][data-v="secretariat"]')
    await pg.evaluate("""(()=>{Object.assign(S.centre,{nom:'DK Group',ville:'Flers',secEmail:'sec@dkgroup.fr',entites:['DK Working | 123 456 789 00012 | 1 rue du Test, 61100 Flers | Jean Dupont, gérant | rh@dkworking.fr'],type:'mixte'});saveCentre();
      const f=newCand('R489');Object.assign(f,{nom:'Intervenant',prenom:'Fanny'});const fi={id:'f1',nom:'Moreau',prenom:'Sophie',roles:['formateur','testeur'],recos:['R489'],cats:{},email:'s@dk.fr'};S.interv.f1=fi;
      const c=newCand('R489');Object.assign(c,{nom:'Martin',prenom:'Lucas',naissance:'1990-03-14',email:'lucas@ex.fr',tel:'0600000000',entreprise:'DK Working',cats:['3'],arrivee:'2026-11-09',depart:'2026-11-12',dateTest:'2026-11-12',statut:'inscrit',formateurId:'f1',testeurId:'f1',type:'CACES',profil:'initiale'});
      c.insc={poste:'Cariste',champs:['Entrepôt / logistique'],niveau:'int',exp:'6 mois à 2 ans',cacesDetenus:'',attestMed:'oui',adaptation:'non',employeur:{nom:'DK Working',siret:'123 456 789 00012',adr:'1 rue du Test, 61100 Flers',sg:'Jean Dupont, gérant'},certifieLe:'2026-11-02T09:10:00Z',source:'formulaire'};
      const bk=BANK[bankKey(c)];c.theo={mode:'qcm',qcm:{ans:bk.map(q=>q.a),bits:bk.map((q,i)=>i===3?'0':'1').join(''),date:'2026-11-12T08:00:00Z'},val:{at:'2026-11-12T09:00:00Z'}};
      S.cands[c.id]=c;const p=prat(c,'3');p.t0='2026-11-12T10:00:00Z';p.t1='2026-11-12T11:00:00Z';p.obs={_fin:'Conduite sûre, bon respect des consignes.'};
      const P=ped(c);pedRows(c).forEach((r,i)=>{P.m[r.k]=i%5===0?1:2;if(i===2)P.n[r.k]='Revoir la prise de palette en hauteur';});P.pb='Gêne visuelle en fin de journée';P.gen='Stagiaire sérieux.';
      P.val.theo={at:'2026-11-12T12:00:00Z',fname:'Sophie MOREAU',sig:'@@SIG@@'};P.val['3']={at:'2026-11-12T16:00:00Z',fname:'Sophie MOREAU',sig:'@@SIG@@'};
      persist(c);window.__id=c.id;})()""".replace('@@SIG@@',SIG))
    await pg.wait_for_timeout(500)
    await pg.evaluate("S.centre.driveRoot='ROOTID'");print("decision:",await pg.evaluate("JSON.stringify(S.cands[__id].cats.map(k=>decisionOf(S.cands[__id],k)))"),"docs:",await pg.evaluate("JSON.stringify(docsOf(S.cands[__id]).map(d=>d.id))"))
    # envoi auto
    await pg.click('[data-tab="docs"]');await pg.wait_for_timeout(300);await pg.screenshot(path='shots/d_tab2.png',full_page=True)
    await pg.fill('[data-xcentre="docMail"]',"kevin@dkgroup.fr, compta@dkgroup.fr");await pg.wait_for_timeout(900)
    await pg.click('[data-act="d_auto"]');await pg.evaluate("S.cands[__id].ped.val['3'].at=new Date().toISOString();S.cands[__id].ped.val.theo.at=new Date().toISOString()")
    await pg.evaluate("S.cands[__id].prat['3'].t1=new Date().toISOString()")
    await pg.evaluate("autoScan()");await pg.wait_for_timeout(40000)
    print("sent:",await pg.evaluate("JSON.stringify(S.cands[__id].docSent)"))
    print("mails:",await pg.evaluate("JSON.stringify((window.__mails||[]).map(m=>[m.to||m.args&&m.args.to,(m.args||m).subject,((m.args||m).attachments||[]).map(a=>a.filename+':'+a.content.length)]))"))
    await pg.evaluate("autoScan()");await pg.wait_for_timeout(40000);await pg.evaluate("autoScan()");await pg.wait_for_timeout(40000);await pg.evaluate("autoScan()");await pg.wait_for_timeout(30000)
    print("mails2:");[print("  ",x) for x in await pg.evaluate("(window.__mails||[]).map(m=>JSON.stringify([(m.args||m).to,(m.args||m).subject.slice(0,48)]))")]
    print("db:",await pg.evaluate("JSON.stringify((JSON.parse(localStorage.getItem('mockstore')).candidats[__id]||{}).docSent)"))
    # captures des documents
    htmls=[]
    for mk in ["dkw"]:
        await pg.evaluate("S.centre.marque='%s'"%mk)
        for i,h in await pg.evaluate("docsOf(S.cands[__id]).map(d=>[d.id,d.build()])"): htmls.append((mk+"_"+i,h))
    await pg.evaluate("S.centre.marque='auto'")
    pg2=await ctx.new_page();await pg2.set_viewport_size({"width":850,"height":1200})
    for i,h in htmls:
        await pg2.set_content(h);await pg2.add_style_tag(content=".np{display:none}");await pg2.screenshot(path=f"shots/doc_{i}.png",full_page=True)
    await pg.evaluate("softReboot(false)");await pg.click('[data-tab="docs"]');print("reboot ok");
    print("errs",errs)
    await b.close()
asyncio.run(main())
