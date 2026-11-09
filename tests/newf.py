import glob,json,os
seen=set(open('seen.txt').read().split('\n')) if os.path.exists('seen.txt') else set()
out=[];done=0;acts=0
for f in glob.glob('mk/*.jsonl'):
    for l in open(f):
        try:d=json.loads(l)
        except: continue
        if d.get('done'): done+=1;acts+=d['actions'];continue
        t=' '.join(d['trail'][-2:])
        if d['kind']=='ecran_vide' and ('Recharger' in t or 'Redémarrage' in t): continue
        if d['kind']=='harness' and 'navigation' in d['msg']: continue
        k=d['kind']+d['msg'][:90]
        if k in seen: continue
        seen.add(k);out.append(f"{d['role']} {d['seed']} {d['kind']} | {d['msg'][:420]}\n   > "+' > '.join(d['trail'][-8:])[:300])
open('seen.txt','w').write('\n'.join(seen))
print(f"sessions finies {done}, actions {acts}, nouveaux {len(out)}");print('\n'.join(out))
