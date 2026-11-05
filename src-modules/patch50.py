s=open('v49/index.html',encoding='utf-8').read()
def rep(o,n):
    global s
    assert s.count(o)==1,(o[:70],s.count(o)); s=s.replace(o,n)
rep('<th>Recommandation</th><th>Catégorie / équipement</th><th style="width:105px">Évaluation du</th><th style="width:105px">Valable jusqu\'au</th>','<th>Recommandation</th><th>Catégorie / équipement</th><th style="width:150px">N° d\'autorisation${c.type==="CACES"?" · N° CACES®":""}</th><th style="width:90px">Évaluation du</th><th style="width:90px">Valable jusqu\'au</th>')
rep('<td>${frDate(dEval)}</td><td>${frDate(fin)}</td></tr>`).join("")}','<td><b>${esc(autNum(c,k))}</b>${c.type==="CACES"?"<br>"+(cacesNum(c,k)?"CACES® n° "+esc(cacesNum(c,k)):"CACES® n° ……………"):""}</td><td>${frDate(dEval)}</td><td>${frDate(fin)}</td></tr>`).join("")}')
rep('return {nom:p[0]||"",siret:p[1]||"",adr:p[2]||"",sg:p[3]||"",mail:p[4]||""};','return {nom:p[0]||"",siret:p[1]||"",adr:p[2]||"",sg:p[3]||"",mail:p[4]||"",drive:p[5]||""};')
rep('Nom | SIRET | Adresse | Signataire | Mail de destination</span>','Nom | SIRET | Adresse | Signataire | Mail | Dossier Drive</span>')
g=open('v50/docs2.js',encoding='utf-8').read()
mark='/* =========================================================================\n   ÉVÉNEMENTS'
assert s.count(mark)==1
s=s.replace(mark,g+'\n'+mark)
open('v50/index.html','w',encoding='utf-8').write(s);print(len(s))
