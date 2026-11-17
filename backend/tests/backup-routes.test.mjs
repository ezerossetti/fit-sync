import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const owner='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222';
const row={id,fecha:'2026-11-16',rutina_nombre:'Test',ejercicios:[{nombre:'Banca',series:[{peso:60,reps:8}]}]};
const handlers={},database={rutinas:new Map(),sesiones:new Map(),ejercicios_personalizados:new Map()};
globalThis.__backup={Router:()=>({use(){},get(path,fn){handlers['GET'+path]=fn},post(path,fn){handlers['POST'+path]=fn}}),supabase:{from(table){const filters={};let insert;return {select(){return this},eq(k,v){filters[k]=v;return this},upsert(record){insert=record;return this},async maybeSingle(){const record=database[table].get(filters.id);return {data:record?.usuario_id===filters.usuario_id?{id:record.id}:null,error:null}},then(resolve){if(insert){const exists=database[table].has(insert.id);if(!exists)database[table].set(insert.id,insert);resolve({data:exists?[]:[{id:insert.id}],error:null})}}}}},usuarioModel:{}};
let source=await readFile(new URL('../src/routes/backup.routes.js',import.meta.url),'utf8');
source=source.replace("import { Router } from 'express';",'const {Router}=globalThis.__backup;').replace("import { requireAuth } from '../middleware/auth.middleware.js';",'const requireAuth=()=>{};').replace("import { supabase } from '../supabase.js';",'const {supabase}=globalThis.__backup;').replace("import { usuarioModel } from '../models/usuario.model.js';",'const {usuarioModel}=globalThis.__backup;').replace("'../utils/backup.js'",JSON.stringify(new URL('../src/utils/backup.js',import.meta.url).href));
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const res=()=>({code:200,status(n){this.code=n;return this},json(body){this.body=body}});
test('restore is idempotent and never overwrites an edited workout',async()=>{
 let response=res();await handlers['POST/restore']({usuarioId:owner,body:{ownerId:owner,kind:'sesiones',records:[row]}},response);assert.equal(response.body.data.added,1);
 database.sesiones.get(id).notas='Edited later';response=res();await handlers['POST/restore']({usuarioId:owner,body:{ownerId:owner,kind:'sesiones',records:[row]}},response);assert.equal(response.body.data.skipped,1);assert.equal(database.sesiones.get(id).notas,'Edited later');
});
test('restore cannot overwrite a UUID owned by another account',async()=>{
 const response=res();await handlers['POST/restore']({usuarioId:'other',body:{ownerId:'other',kind:'sesiones',records:[row]}},response);assert.equal(response.code,500);assert.equal(database.sesiones.get(id).usuario_id,owner);
});
test('invalid batch makes no partial writes and account mismatch is rejected',async()=>{
 const size=database.sesiones.size,response=res();await handlers['POST/restore']({usuarioId:owner,body:{ownerId:owner,kind:'sesiones',records:[{...row,id:'33333333-3333-4333-8333-333333333333'},{id:'bad'}]}},response);assert.equal(response.code,400);assert.equal(database.sesiones.size,size);
 const other=res();await handlers['POST/restore']({usuarioId:owner,body:{ownerId:'other',kind:'sesiones',records:[row]}},other);assert.equal(other.code,400);
});
