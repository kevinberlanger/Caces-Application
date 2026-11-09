#!/bin/bash
# une boucle par rôle ; sessions de 5 min, graine différente à chaque tour ; ~58 min au total
cd /tmp/agent
END=$(( $(date +%s) + 3480 ))
for role in admin formateur testeur secretariat; do
 ( s=$(( RANDOM % 1000 * 10 )); while [ $(date +%s) -lt $END ]; do s=$((s+1)); 
   rem=$(( END - $(date +%s) )); d=300; [ $rem -lt 300 ] && d=$rem; [ $d -lt 20 ] && break
   timeout $((d+60)) python3 monkey.py /tmp/agent/site.html $s $d $role mk/${role}_$s.jsonl >/dev/null 2>&1; done ) &
done
wait
echo FIN > mk/FIN
