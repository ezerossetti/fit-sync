import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
globalThis.__coachMock = {
 groqService:{generarRespuesta:async()=> 'Respuesta válida'},
 coachModel:{obtenerHistorialChat:async()=>{throw new Error('table unavailable')},guardarMensaje:async()=>{throw new Error('write unavailable')}}
};
const source=(await readFile(new URL('../src/controllers/coach.controller.js',import.meta.url),'utf8'))
 .replace("import { groqService } from '../services/groq.service.js';",'const {groqService}=globalThis.__coachMock;')
 .replace("import { coachModel } from '../models/coach.model.js';",'const {coachModel}=globalThis.__coachMock;');
const {coachController}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function response(){return {status(code){this.code=code;return this},json(body){this.body=body;return this}}}
test('history failure does not discard valid coach response and is disclosed',async()=>{
 const res=response();await coachController.chat({usuarioId:'test',body:{mensaje:'Hola'}},res);
 assert.equal(res.code,200);assert.equal(res.body.data.respuesta,'Respuesta válida');assert.match(res.body.data.advertencia,/no pude guardar/);
});
test('invalid chat messages never reach provider',async()=>{
 for(const mensaje of [null,{},'   ','a'.repeat(4001)]){
  const res=response();await coachController.chat({usuarioId:'test',body:{mensaje}},res);assert.equal(res.code,400);
 }
});
