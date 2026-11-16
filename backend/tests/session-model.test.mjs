import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const rows = new Map()
globalThis.__sessionTestDatabase = {
 from() {
  let inserted; const filters = {}
  return {
   insert([row]) { inserted = row; return this },
   select() { return this },
   eq(key,value) { filters[key] = value; return this },
   async single() {
    if (rows.has(inserted.id)) return { data: null, error: {code:'23505'} }
    rows.set(inserted.id, structuredClone(inserted)); return {data:structuredClone(inserted),error:null}
   },
   async maybeSingle() { const row=rows.get(filters.id);return {data:row?.usuario_id===filters.usuario_id ? structuredClone(row) : null,error:null} }
  }
 }
}
const source = (await readFile(new URL('../src/models/sesion.model.js',import.meta.url),'utf8')).replace("import { supabase } from '../supabase.js';",'const supabase = globalThis.__sessionTestDatabase;')
const {sesionModel} = await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))
test('concurrent retries return one immutable workout and preserve null duration',async()=>{
 const payload={id:'same-workout',usuario_id:'A',fecha:'2026-11-16',rutina_nombre:'Test',duracion_min:null,calorias_estimadas:null}
 const [a,b]=await Promise.all([sesionModel.create(payload),sesionModel.create({...payload,rutina_nombre:'Do not overwrite'})])
 assert.equal(rows.size,1);assert.equal(a.id,b.id);assert.equal(b.rutina_nombre,'Test');assert.equal(b.duracion_min,null);assert.equal(b.calorias_estimadas,null)
})
test('a different account cannot read a UUID collision',async()=>{
 const original=console.error;console.error=()=>{}
 try { await assert.rejects(sesionModel.create({id:'same-workout',usuario_id:'B',fecha:'2026-11-16',rutina_nombre:'Wrong owner'}));assert.equal(rows.get('same-workout').usuario_id,'A') }
 finally { console.error=original }
})
