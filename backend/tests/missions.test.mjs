import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {validMissionSelection} from '../src/utils/missions.js';
test('mission selection accepts a days goal and weeks, rejecting duplicates, unknowns and competing day goals',()=>{
 assert(validMissionSelection('2026-11',['days8','weeks4']));assert(validMissionSelection('2026-11',[]));for(const ids of [['days8','days12'],['days8','days8'],['x']])assert(!validMissionSelection('2026-11',ids));assert(!validMissionSelection('2026-13',['days8']));
});
let profile={preferencias:{metaSemanal:3,ordenRutinas:['a'],misiones:{'2026-10':['weeks4']}}};
globalThis.__missionsModel={getById:async()=>profile,update:async(id,value)=>{assert.equal(id,'owner');profile=value;return value}};
let source=(await readFile(new URL('../src/controllers/usuario.controller.js',import.meta.url),'utf8')).replace("import { usuarioModel } from '../models/usuario.model.js';",'const usuarioModel=globalThis.__missionsModel;').replace("'../utils/missions.js'",JSON.stringify(new URL('../src/utils/missions.js',import.meta.url).href));
const {usuarioController}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const response=()=>({status(n){this.code=n;return this},json(value){this.body=value}});
test('saving mission selection keeps unrelated settings and previous months',async()=>{const res=response();await usuarioController.missions({usuarioId:'owner',body:{month:'2026-11',ids:['days8']}},res);assert.equal(res.body.success,true);assert.equal(profile.preferencias.metaSemanal,3);assert.deepEqual(profile.preferencias.misiones['2026-10'],['weeks4']);assert.deepEqual(profile.preferencias.misiones['2026-11'],['days8']);});
