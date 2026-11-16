import {test} from 'node:test'
import assert from 'node:assert/strict'
import {validarSesion} from '../src/utils/validarSesion.js'
const valid = () => ({id:'33333333-3333-4333-8333-333333333333',fecha:'2026-11-16T10:00:00Z',rutina_nombre:'Empuje',ejercicios:[{nombre:'Press',series:[{peso:60,reps:8,rpe:null},{peso:62.5,reps:8,rpe:8}]}],duracion_min:null,calorias_estimadas:null,volumen_total:99999})
test('volume is recomputed and unknown duration remains null',()=>{const r=validarSesion(valid());assert.equal(r.error,undefined);assert.equal(r.data.volumen_total,980);assert.equal(r.data.duracion_min,null)})
test('invalid weight, repetitions and RPE are rejected',()=>{for(const patch of [{peso:-1},{peso:NaN},{reps:0},{reps:2.5},{reps:'8'},{rpe:11}]){const data=valid();Object.assign(data.ejercicios[0].series[0],patch);assert.ok(validarSesion(data).error)}})
test('invalid ids, dates, empty workouts and invalid notes are rejected',()=>{for(const patch of [{id:'bad-id'},{fecha:'not-a-date'},{ejercicios:[]},{notas:42},{rutina_nombre:' '}])assert.ok(validarSesion({...valid(),...patch}).error)})
test('body-weight work with zero external load is accepted',()=>{const d=valid();d.ejercicios[0].series[0].peso=0;assert.equal(validarSesion(d).error,undefined)})
