#!/bin/sh
# Valideert één vertaalde lestaal: ./valideer-taal.sh tr
T=$1
F=$(ls content/$T/*.md 2>/dev/null | wc -l | tr -d ' ')
D=$(grep -o "—\|–" content/$T/*.md content/vragen-vertalingen/$T.json 2>/dev/null | wc -l | tr -d ' ')
Q=$(python3 -c "import json; print(len(json.load(open('content/vragen-vertalingen/$T.json'))))" 2>/dev/null || echo 0)
QK=$(python3 -c "
import json
bron=[v['id'] for f in ('vragen-kennis','vragen-gevaar') for v in json.load(open(f'content/vragen/{f}.json'))]
d=json.load(open('content/vragen-vertalingen/$T.json'))
mis=[i for i in bron if i not in d]
kapot=[k for k,w in d.items() if not (w.get('v') and isinstance(w.get('opts'),list) and w.get('uitleg'))]
print(f'ontbrekend:{len(mis)} kapot:{len(kapot)}')" 2>/dev/null)
echo "[$T] bestanden:$F/17 dashes:$D vragen:$Q/85 $QK"
node build.js >/dev/null 2>&1 && node --input-type=module -e "
import('./worker-content.js').then(m=>{
  const c=m.CONTENT['$T'];
  if(!c){console.log('[$T] NIET in build'); process.exit(1)}
  const parts=c.modules.flatMap(x=>x.parts);
  const stappen=parts.filter(p=>p.step).length;
  const fotos=parts.filter(p=>p.html.includes('img/')).length;
  const vert=m.VRAGEN.filter(v=>v['$T']).length;
  console.log('[$T] modules:'+c.modules.length+'/17 stap-delen:'+stappen+' fotos:'+fotos+' vraagvertalingen:'+vert+'/85');
})" 2>/dev/null
