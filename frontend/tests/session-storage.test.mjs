import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import * as storage from '../src/utils/sesionDraft.js'
import { elapsedSeconds } from '../src/utils/restClock.js'
beforeEach(() => {
  const values = {}
  globalThis.localStorage = new Proxy({
    setItem(k,v) { values[k] = String(v) }, getItem(k) { return values[k] ?? null }, removeItem(k) { delete values[k] }
  }, { ownKeys: () => Object.keys(values), getOwnPropertyDescriptor: (_,k) => k in values ? {enumerable:true,configurable:true} : undefined })
})
test('two offline workouts survive independently', () => {
  storage.guardarSesionPendiente({id:'one'},'A'); storage.guardarSesionPendiente({id:'two'},'A')
  assert.equal(storage.leerSesionesPendientes('A').length,2)
  storage.borrarSesionPendiente('A','one')
  assert.deepEqual(storage.leerSesionesPendientes('A').map(s=>s.payload.id),['two'])
})
test('switching accounts cannot read another account pending workouts or draft', () => {
  storage.guardarSesionPendiente({id:'one'},'A'); storage.guardarBorrador({sessionId:'one'},'A')
  assert.equal(storage.leerSesionesPendientes('B').length,0); assert.equal(storage.leerBorrador('B'),null)
  storage.guardarSesionPendiente({id:'two'},'B'); storage.borrarSesionPendiente('B','two')
  assert.equal(storage.leerSesionesPendientes('A').length,1)
})
test('sync of an older workout does not delete a newer draft', () => {
  storage.guardarSesionPendiente({id:'old'},'A'); storage.guardarBorrador({sessionId:'new'},'A')
  storage.borrarSesionPendiente('A','old'); assert.equal(storage.leerBorrador('A').sessionId,'new')
})
test('retrying the same pending UUID does not duplicate a queue item', () => {
  storage.guardarSesionPendiente({id:'one'},'A');storage.guardarSesionPendiente({id:'one'},'A')
  assert.equal(storage.leerSesionesPendientes('A').length,1)
})
test('legacy unowned data is not assigned automatically', () => {
  localStorage.setItem('fitsync_sesion_draft',JSON.stringify({notas:'legacy'}))
  assert.equal(storage.leerBorrador('A'),null);assert.equal(storage.hayDatosAnteriores(),true)
  storage.recuperarDatosAnteriores('A');assert.equal(storage.leerBorrador('A').notas,'legacy')
  assert.equal(storage.hayDatosAnteriores(),false)
})
test('storage exhaustion is reported rather than pretending to save', () => {
  localStorage.setItem = () => { throw new Error('QuotaExceededError') }
  assert.throws(()=>storage.guardarSesionPendiente({id:'one'},'A'),/QuotaExceeded/)
})
test('missing owner or identifier cannot create pending work', () => {
  assert.throws(()=>storage.guardarSesionPendiente({id:'one'}));assert.throws(()=>storage.guardarSesionPendiente({},'A'))
})
test('rest timer catches up after background suspension and retains paused time', () => {
  assert.equal(elapsedSeconds(0,1000,91000),90)
  assert.equal(elapsedSeconds(25,100000,115000),40)
  assert.equal(elapsedSeconds(25,100000,99000),25)
})
