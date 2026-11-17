import test from 'node:test';import assert from 'node:assert/strict';
import {personalRecords,monthlyWrapped,missionProgress,MISSIONS,muscleActivity,muscleGroup} from '../src/utils/moments.js';
const now=new Date('2026-11-20T15:00:00'),row=(id,date,peso,reps=8)=>({id,fecha:date,completada:true,ejercicios:[{nombre:'Banca',series:[{peso,reps}]}]});
test('PR requires prior baseline and compares to all-time best, not previous session',()=>{
 const rows=[row('a','2026-10-01',100),row('b','2026-11-01',80),row('c','2026-11-02',90),row('d','2026-11-03',105),row('e','2026-11-04',105,9)];
 const records=personalRecords(rows,now);assert.deepEqual(records.map(r=>r.sessionId),['d','e']);assert.equal(records[1].type,'repeticiones');assert.equal(records[0].previous.peso,100);
 assert.equal(personalRecords([rows[0]],now).length,0);
});
test('records deduplicate synced workout and ignore unfinished/future sessions',()=>{
 const a=row('a','2026-10-01',50),b=row('b','2026-11-01',60);
 assert.equal(personalRecords([a,b,b,{...row('x','2026-11-02',80),completada:false},row('f','2026-12-01',100)],now).length,1);
});
test('Wrapped uses selected month, counts distinct days and global record baseline',()=>{
 const rows=[row('a','2026-10-01',100),row('b','2026-11-01',80),row('c','2026-11-01',90),row('d','2026-11-05',105)];
 const stats=monthlyWrapped(rows,'2026-11',now);assert.equal(stats.sessions,3);assert.equal(stats.days,2);assert.equal(stats.records,1);assert.equal(stats.volume,2200);assert.equal(stats.favorite,'Banca');assert.equal(stats.partial,true);assert.equal(monthlyWrapped(rows,'2026-10',now).partial,false);
});
test('missions count distinct days/weeks and recalculate after deleting sessions',()=>{
 const rows=Array.from({length:8},(_,i)=>row(String(i),`2026-11-${String(i+1).padStart(2,'0')}`,60));
 assert.equal(missionProgress([...rows,rows[0]],'2026-11',MISSIONS[0],now).complete,true);
 assert.equal(missionProgress(rows.slice(1),'2026-11',MISSIONS[0],now).complete,false);
 assert.equal(missionProgress(rows,'2026-11',MISSIONS[2],now).actual,2);
});
test('muscle map counts actual weekly sets, includes zero-load and exposes unclassified exercises',()=>{
 const rows=[row('a','2026-11-18',0),{id:'b',fecha:'2026-11-19',completada:true,ejercicios:[{nombre:'Inventado',series:[{peso:0,reps:10}]}]},row('old','2026-10-01',100)];
 const data=muscleActivity(rows,name=>name==='Banca'?{grupo:'Empuje / Pecho'}:null,now);
 assert.equal(data.chest.sets,1);assert.equal(data.other.sets,1);assert.equal(muscleGroup('Piernas / Isquiotibiales'),'posterior');assert.equal(muscleGroup('Hombros / Deltoides lateral'),'shoulders');
});
