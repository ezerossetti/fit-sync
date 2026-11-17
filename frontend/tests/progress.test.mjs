import test from 'node:test';
import assert from 'node:assert/strict';
import {exercisePoints,weeklyActivity,dayKey,csvHistory} from '../src/utils/progress.js';
const now=new Date(2026,10,16,10);
const session=(id,fecha,series,extra={})=>({id,fecha,completada:true,ejercicios:[{nombre:'Banca',series}],...extra});
test('progress uses best weight, reps tie-break, all sets volume and conservative estimate',()=>{
 const points=exercisePoints([session('a','2026-11-16',[{peso:60,reps:6},{peso:60,reps:8},{peso:50,reps:12}])],'Banca',28,now);
 assert.equal(points.length,1);assert.equal(points[0].reps,8);assert.equal(points[0].volume,1440);assert.equal(points[0].estimate,76);
 assert.equal(exercisePoints([session('a','2026-11-16',[{peso:60,reps:11}])],'Banca',0,now)[0].estimate,null);
 assert.equal(exercisePoints([session('a','2026-11-16',[{peso:100,reps:1}])],'Banca',0,now)[0].estimate,100);
});
test('period excludes future and unfinished sessions; date-only is local today even before noon',()=>{
 const rows=[session('old','2026-09-01',[{peso:40,reps:8}]),session('now','2026-11-16',[{peso:0,reps:10}]),session('future','2026-11-17',[{peso:70,reps:8}]),session('draft','2026-11-15',[{peso:60,reps:8}],{completada:false})];
 assert.deepEqual(exercisePoints(rows,'Banca',28,now).map(p=>p.id),['now']);assert.equal(exercisePoints(rows,'Banca',0,now).length,2);assert.equal(dayKey('2026-11-16'),'2026-11-16');
});
test('weekly consistency counts days, not number of sessions',()=>{
 const weeks=weeklyActivity([session('a','2026-11-16',[{peso:60,reps:8}]),session('b','2026-11-16',[{peso:60,reps:8}])],now);
 assert.equal(weeks.at(-1).days,1);assert.equal(weeks.at(-1).sessions,2);assert.equal(weeks.at(-1).volume,960);
});
test('CSV quotes multiline notes and neutralizes spreadsheet formulas',()=>{
 const csv=csvHistory([session('a','2026-11-16',[{peso:60,reps:8}],{rutina_nombre:'=2+2',notas:'hola,"mundo"\nsegunda línea'})]);
 assert(csv.includes('"\'=2+2"'));assert(csv.includes('hola,""mundo""\nsegunda línea'));
});
