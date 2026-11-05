/* =========================================================================
   MARQUES : chartes DK Working, DT Signs × DK Printing, KODO (documents)
   ========================================================================= */
const LOGO_DKW="@@LOGO_DKW@@",LOGO_KODO="@@LOGO_KODO@@";
const GF="https://fonts.googleapis.com/css2?";
const BRANDS={
  dkw:{id:"dkw",nom:"DK Working",logo:LOGO_DKW,lh:48,c1:"#0F172A",c2:"#0066B3",ac:"#F59E0B",soft:"#F5F7F9",line:"#D7DEE7",txt:"#0F172A",mut:"#64748B",f:"Inter",h:"Inter",hw:800,
    fonts:GF+"family=Inter:wght@400;600;700;800&display=swap",tag:"Filiale du groupe DK",foot:"DK Working SAS · 26 rue du Maréchal Leclerc, 59128 Flers-en-Escrebieux · 03 27 99 10 81 · www.dkworking.fr"},
  dts:{id:"dts",nom:"DT Signs × DK Printing",logo:"",wm:["DT SIGNS","DK PRINTING"],lh:30,c1:"#0F0D0C",c2:"#1C1815",ac:"#E85E10",soft:"#F1F1F0",line:"#DADADA",txt:"#0F0D0C",mut:"#6E655C",f:"Instrument Sans",h:"Bricolage Grotesque",hw:800,
    fonts:GF+"family=Bricolage+Grotesque:wght@800&family=Instrument+Sans:wght@400;600&family=Space+Mono:wght@400;700&display=swap",tag:"Du pixel à la façade.",foot:""},
  kodo:{id:"kodo",nom:"KODO",logo:LOGO_KODO,lh:34,c1:"#1d0f1a",c2:"#6f3a5f",ac:"#f6ad19",soft:"#faf6f0",line:"#ece2e8",txt:"#1d0f1a",mut:"#6b5d67",f:"DM Sans",h:"Montserrat",hw:800,
    fonts:GF+"family=Montserrat:wght@800&family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap",tag:"Intégrateur Odoo · membre du groupe DK",foot:"KODO · 8 rue Marie Madeleine, 62119 Dourges · 03 27 99 10 85 · kodo.fr"},
  neutre:{id:"neutre",nom:"",logo:"",lh:34,c1:"#111827",c2:"#374151",ac:"#F59E0B",soft:"#F3F4F6",line:"#D1D5DB",txt:"#111827",mut:"#6B7280",f:"Arial",h:"Arial",hw:800,fonts:"",tag:"",foot:""}};
const MARQUES=[["auto","Automatique (selon l'entreprise)"],["dkw","DK Working"],["dts","DT Signs × DK Printing"],["kodo","KODO"],["neutre","Neutre"]];
function brandKey(c){const o=S.centre.marque;if(o&&o!=="auto"&&BRANDS[o])return o;
  const t=s=>/dk\s*working|dkw/i.test(s)?"dkw":/dt\s*signs|dk\s*printing/i.test(s)?"dts":/kodo/i.test(s)?"kodo":null;
  return (c&&t(c.entreprise||""))||t(strNom())||"neutre";}
const brandOf=c=>BRANDS[brandKey(c)];
function brandHead(b,title){const lg=b.logo?`<img src="${b.logo}" alt="${esc(b.nom)}" style="height:${b.lh}px;display:block">`:b.wm?`<div class="wm">${b.wm[0]} <i>×</i> ${b.wm[1]}</div>`:`<div class="wm">${esc(strNom()||"")}</div>`;
  return `<div class="bh"><div>${lg}${b.tag?`<div class="tg">${esc(b.tag)}</div>`:""}</div><div class="bt">${esc(title)}<br><span>Édité le ${new Date().toLocaleDateString("fr-FR")}</span></div></div>`;}
function brandCss(b){return `${b.fonts?`@import url('${b.fonts}');`:""}
body{font-family:'${b.f}',Arial,Helvetica,sans-serif;color:${b.txt}}
.bh{display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;margin-bottom:16px;border-bottom:3px solid ${b.ac}}
.bh .wm{font:${b.hw} 17px '${b.h}',Arial,sans-serif;letter-spacing:.01em}.bh .wm i{color:${b.ac};font-style:normal}.bh .tg{font-size:10px;color:${b.mut};margin-top:3px;letter-spacing:.03em}
.bh .bt{text-align:right;font:700 11px '${b.f}',Arial;text-transform:uppercase;letter-spacing:.08em;color:${b.c2==="#0066B3"||b.id==="kodo"?b.c2:b.txt}}.bh .bt span{font-weight:400;color:${b.mut};text-transform:none;letter-spacing:0}
h1{font-family:'${b.h}',Arial,sans-serif;font-weight:${b.hw};background:${b.c1};color:#fff;padding:12px 16px;border-left:7px solid ${b.ac};letter-spacing:-.01em;margin:6px 0 10px}
h2{font-family:'${b.h}',Arial,sans-serif;font-weight:${b.hw};color:${b.id==="dts"?b.txt:b.c2===b.c1?b.txt:b.c2};border-bottom:2px solid ${b.ac}}
th{background:${b.soft};color:${b.txt};border-color:${b.line}}td{border-color:${b.line}}
.sig>div{border:1px solid ${b.line};background:${b.soft}}.big{font-family:'${b.h}',Arial;color:${b.c1};border-bottom:3px solid ${b.ac};display:inline-block;padding:0 10px 4px}.big{display:block;text-align:center;border-bottom:0}
.vl{border-bottom:1px solid ${b.line};background:${b.soft}}.pill.ok{background:#dcfce7}.ph{border-color:${b.mut};background:${b.soft}}
.ft{border-top:3px solid ${b.ac};color:${b.mut};display:flex;justify-content:space-between;gap:12px}.ft b{color:${b.txt}}`;}
(function(){const st=document.createElement("style");st.textContent=".html2pdf__overlay{pointer-events:none!important}";document.head.appendChild(st);})();
