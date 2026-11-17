import test from 'node:test';import assert from 'node:assert/strict';
import {cleanRecord,validateBackup} from '../src/utils/backup.js';
const owner='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222';
const row={id,fecha:'2026-11-16',rutina_nombre:'Banca',ejercicios:[{nombre:'Banca',series:[{peso:60,reps:8}]}],volumen_total:999,usuario_id:'attacker'};
const backup={format:'fitsync-backup',version:1,ownerId:owner,sesiones:[row],rutinas:[],ejercicios_personalizados:[],preferencias:{metaSemanal:3}};
test('backup strips owner fields and recomputes session volume',()=>{const data=validateBackup(backup,owner);assert.equal(data.sesiones[0].volumen_total,480);assert.equal(data.sesiones[0].usuario_id,undefined)});
test('backup rejects other accounts, duplicates and invalid data before restoration',()=>{
 assert.throws(()=>validateBackup(backup,'other'),/otra cuenta/);
 assert.throws(()=>validateBackup({...backup,sesiones:[row,row]},owner),/repetidos/);
 assert.throws(()=>validateBackup({...backup,preferencias:{metaSemanal:100}},owner),/fuera de rango/);
 assert.throws(()=>cleanRecord('sesiones',{...row,ejercicios:[{nombre:'Banca',series:[{peso:-1,reps:8}]}]}),/peso válido/);
 assert.throws(()=>cleanRecord('users',{id,nombre:'X'}),/desconocido/);
});
