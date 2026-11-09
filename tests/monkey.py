import asyncio,sys,json,random,time
from playwright.async_api import async_playwright
URL="file://"+sys.argv[1];SEED=int(sys.argv[2]);DUR=int(sys.argv[3]);ROLE=sys.argv[4];OUT=sys.argv[5]
MOCK=open("mock.js").read();H2P=open("/tmp/h2p/node_modules/html2pdf.js/dist/html2pdf.bundle.min.js").read()
R=random.Random(SEED)
TXT=["","a","Dupont","é à ü ñ","12345","0600000000","a@b.fr","x"*300,"<script>alert(1)</script>","'; DROP TABLE--","😀🚜","  ","-1","99999999","2026-11-12","1990-01-01","‮","null","undefined","{}","[]"]
PICK="""(()=>{const sel='button,[data-act],[data-tab],a[href],input[type=checkbox],input[type=radio],select,summary,[role=tab]';
const els=[...document.querySelectorAll(sel)].filter(e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>2&&r.height>2&&s.visibility!=='hidden'&&s.display!=='none'&&!e.disabled&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth});
if(!els.length)return null;const e=els[Math.floor(Math.random()*els.length)];const r=e.getBoundingClientRect();
return {x:r.left+r.width/2,y:r.top+r.height/2,d:(e.dataset&&(e.dataset.act||e.dataset.tab))||e.tagName,t:(e.innerText||e.value||'').slice(0,30),href:e.getAttribute&&e.getAttribute('href')}})()"""
PICKIN="""(()=>{const els=[...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=button]),textarea,select')].filter(e=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2&&!e.disabled&&!e.readOnly&&r.bottom>0&&r.top<innerHeight});
if(!els.length)return null;const e=els[Math.floor(Math.random()*els.length)];const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,tag:e.tagName,type:e.type,d:e.dataset&&Object.keys(e.dataset).join(',')}})()"""
SEEDJS="""(()=>{try{const mk=(e,n,p)=>({c:'MK'+n,r:'R489',n,p,d:'1990-01-01',e,t:'0600000000',en:'DK',po:'Cariste',ch:['Atelier de production'],nv:'deb',xp:'Aucune',am:'oui',ad:'non',ts:new Date().toISOString()});
['Alpha','Beta','Gamma'].forEach((n,i)=>importOne(mk(n.toLowerCase()+'@ex.fr',n,'P'+i),'code'));
const c=newCand('R489');Object.assign(c,{nom:'Martin',prenom:'Lucas',naissance:'1990-03-14',email:'lucas@ex.fr',tel:'0600000000',entreprise:'DK Working',cats:['3'],arrivee:'2026-11-09',depart:'2026-11-12',dateTest:'2026-11-12',statut:'inscrit'});S.cands[c.id]=c;persist(c);
const d=newCand('R485');Object.assign(d,{nom:'Durand',prenom:'Zoé',cats:['1'],statut:'inscrit'});S.cands[d.id]=d;persist(d);
S.cur=c.id;render();}catch(e){window.__seedErr=String(e)}})()"""
async def main():
  seen={};log=open(OUT,"w");trail=[];n=0;t0=time.time()
  def rec(kind,msg):
    k=kind+"|"+msg[:120]
    if k in seen: seen[k]+=1;return
    seen[k]=1;log.write(json.dumps({"seed":SEED,"role":ROLE,"n":n,"kind":kind,"msg":msg[:400],"trail":trail[-14:]},ensure_ascii=False)+"\n");log.flush()
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":R.choice([390,768,1280]),"height":900},accept_downloads=True);await ctx.add_init_script(MOCK)
    await ctx.route("https://cdnjs.cloudflare.com/**",lambda r:r.fulfill(body=H2P,content_type="application/javascript"))
    await ctx.route("https://fonts.g**/**",lambda r:r.abort());await ctx.route("https://dark-bird**/**",lambda r:r.abort())
    pg=await ctx.new_page()
    pg.on("pageerror",lambda e:rec("pageerror",str(e)+" || "+" / ".join((getattr(e,"stack","") or "").split("\n")[1:4])))
    pg.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
    async def setup():
      await pg.goto(URL);await pg.wait_for_timeout(700)
      await pg.evaluate("localStorage.setItem('caces.role','%s')"%ROLE) if ROLE!="admin" else None
      try:
        await pg.click('[data-act="role"][data-v="%s"]'%ROLE,timeout=2000)
      except Exception: pass
      await pg.evaluate(SEEDJS)
    await setup()
    ctx.on("page",lambda q:asyncio.ensure_future(q.close()))
    last_err=0
    while time.time()-t0<DUR:
      n+=1
      try:
        a=R.random()
        if a<0.62:
          e=await pg.evaluate(PICK)
          if not e: await pg.keyboard.press("Escape");continue
          if e.get("href") and not e["href"].startswith("#"): continue
          trail.append(f"click {e['d']}:{e['t']}");await pg.mouse.click(e["x"],e["y"])
        elif a<0.84:
          e=await pg.evaluate(PICKIN)
          if not e: continue
          v=R.choice(TXT);trail.append(f"fill {e['tag']}/{e['type']}/{e['d']}={v[:15]!r}")
          await pg.mouse.click(e["x"],e["y"])
          if e["tag"]=="SELECT": await pg.keyboard.press(R.choice(["ArrowDown","ArrowUp","Enter"]))
          else:
            await pg.keyboard.press("Control+A");await pg.keyboard.type(v[:80]) if e["type"] not in("date","time","number","email") else await pg.keyboard.type(R.choice(["2026-11-12","10:30","5","a@b.fr"]))
        elif a<0.90:
          k=R.choice(["Tab","Enter","Escape","ArrowDown","PageDown","Space"]);trail.append("key "+k);await pg.keyboard.press(k)
        elif a<0.94:
          trail.append("scroll");await pg.mouse.wheel(0,R.choice([-600,400,900]))
        elif a<0.96:
          off=R.random()<0.5;trail.append("offline "+str(off));await ctx.set_offline(off);await pg.evaluate("window.dispatchEvent(new Event('%s'))"%("offline" if off else "online"))
        elif a<0.975:
          trail.append("reload");await pg.reload();await pg.wait_for_timeout(500)
        else:
          await ctx.set_offline(False);trail.append("autoScan");await pg.evaluate("try{autoScan()}catch(e){}")
        await pg.wait_for_timeout(R.choice([30,60,120]))
        # erreurs applicatives
        ne=await pg.evaluate("(window.S&&S.errLog?S.errLog.length:0)")
        if ne>last_err:
          errs=await pg.evaluate("S.errLog.slice(%d).map(e=>e.kind+': '+e.msg+' @ '+e.where)"%last_err)
          for m in errs: rec("applog",m)
          last_err=ne
        if n%25==0:
          h=await pg.evaluate("document.body.innerText.length")
          if h<30 and "Recharger" not in " ".join(trail[-2:]) and "reload" not in " ".join(trail[-2:]): rec("ecran_vide","body.innerText="+str(h))
      except Exception as ex:
        s=str(ex)
        if "closed" in s.lower(): rec("crash_page",s[:200]);break
        if "Timeout" not in s: rec("harness",s[:150])
    log.write(json.dumps({"done":True,"actions":n,"uniques":len(seen),"seed":SEED,"role":ROLE})+"\n");log.close();await b.close()
asyncio.run(main())
