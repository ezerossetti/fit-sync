import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const routines=[{id:'a',creada_en:'2026-01-01'},{id:'b',creada_en:'2026-01-02'}];let profile={preferencias:{metaSemanal:4}},writes=0;
globalThis.__orderMocks={rutinaModel:{getAll:async()=>[...routines]},usuarioModel:{getById:async()=>profile,update:async(id,data)=>{writes++;profile=data;return data}}};
const source=(await readFile(new URL('../src/controllers/rutina.controller.js',import.meta.url),'utf8')).replace("import { rutinaModel } from '../models/rutina.model.js';",'const {rutinaModel}=globalThis.__orderMocks;').replace("import { usuarioModel } from '../models/usuario.model.js';",'const {usuarioModel}=globalThis.__orderMocks;');
const {rutinaController}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const res=()=>({status(n){this.code=n;return this},json(body){this.body=body}});
test('reordering persists and retains training preferences',async()=>{
 const response=res();await rutinaController.reorder({usuarioId:'owner',body:{ids:['b','a']}},response);assert.equal(profile.preferencias.metaSemanal,4);
 const list=res();await rutinaController.getAll({params:{usuarioId:'owner'}},list);assert.deepEqual(list.body.data.map(r=>r.id),['b','a']);
});
test('foreign, duplicate and incomplete routine orders cannot be written',async()=>{
 const before=writes;for(const ids of [['foreign','a'],['a','a'],['a']]){const response=res();await rutinaController.reorder({usuarioId:'owner',body:{ids}},response);assert.equal(response.code,400)}assert.equal(writes,before);
});
