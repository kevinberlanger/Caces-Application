(()=>{const load=()=>{try{return JSON.parse(localStorage.getItem("mockstore")||"{}")}catch(e){return {}}};
let st=load();const save=()=>localStorage.setItem("mockstore",JSON.stringify(st));
window.__mails=JSON.parse(localStorage.getItem("mockmails")||"[]");
const subs=[];const off=()=>window.__off===true;
const fail=()=>Promise.reject(Object.assign(new Error("network"),{code:"unavailable"}));
const col=n=>(st[n]=st[n]||{});
const notify=()=>{if(off())return;subs.forEach(s=>s());};
const csnap=n=>{const d=Object.entries(col(n)).map(([id,x])=>({id,data:()=>JSON.parse(JSON.stringify(x))}));return {size:d.length,empty:!d.length,docs:d};};
const docApi=(n,id)=>({get:()=>off()?fail():Promise.resolve({exists:!!col(n)[id],id,data:()=>col(n)[id]}),
 set:d=>{if(off())return fail();col(n)[id]=JSON.parse(JSON.stringify(d));save();notify();return Promise.resolve();},
 update:d=>{if(off())return fail();if(!col(n)[id])return Promise.reject(new Error("not found"));Object.assign(col(n)[id],JSON.parse(JSON.stringify(d)));save();notify();return Promise.resolve();},
 delete:()=>{if(off())return fail();delete col(n)[id];save();notify();return Promise.resolve();},
 onSnapshot:(cb)=>{const f=()=>cb({exists:!!col(n)[id],data:()=>col(n)[id]});subs.push(f);setTimeout(f,0);return ()=>{};}});
const db={collection:n=>({doc:id=>docApi(n,id),onSnapshot:cb=>{const f=()=>cb(csnap(n));subs.push(f);setTimeout(f,0);return ()=>{}},
  where:(f,o,v)=>({limit:k=>({get:()=>{if(off())return fail();const d=Object.entries(col(n)).filter(([,x])=>x[f]===v).slice(0,k).map(([id,x])=>({id,data:()=>x}));return Promise.resolve({empty:!d.length,size:d.length,docs:d});}})})}),
  doc:p=>{const [a,b]=p.split("/");return docApi(a,b);}};
const mcp={callTool:(s,t,a)=>{if(off())return fail();window.__mails.push(a);localStorage.setItem("mockmails",JSON.stringify(window.__mails));return Promise.resolve({id:"m"+window.__mails.length});}};
window.claude={use:async k=>k==="db"?db:k==="mcp"?mcp:null};
window.__dump=()=>st;
})();
