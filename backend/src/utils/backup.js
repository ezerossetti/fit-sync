import { validarSesion } from './validarSesion.js';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const text=(value,max,required=false)=>typeof value==='string'&&value.length<=max&&(!required||value.trim().length>0);
const pick=(row,keys)=>Object.fromEntries(keys.filter(k=>row[k]!==undefined).map(k=>[k,row[k]]));
export function cleanRecord(kind,row){
 if(!row||typeof row!=='object'||!uuid.test(row.id))throw new Error('Identificador inválido en el respaldo.');
 if(kind==='sesiones'){
  const result=validarSesion(row);if(result.error)throw new Error(result.error);
  if(row.rutina_id!=null&&!uuid.test(row.rutina_id))throw new Error('Referencia de rutina inválida.');
  return pick(result.data,['id','fecha','rutina_id','rutina_nombre','ejercicios','volumen_total','duracion_min','completada','notas','calorias_estimadas']);
 }
 if(!text(row.nombre,200,true))throw new Error('Nombre inválido en el respaldo.');
 if(row.descripcion!=null&&!text(row.descripcion,10000))throw new Error('Descripción inválida.');
 if(kind==='rutinas'){
  if(!Array.isArray(row.ejercicios)||row.ejercicios.length>100||row.ejercicios.some(e=>!e||!text(e.nombre,200,true)))throw new Error('Ejercicios de rutina inválidos.');
  if(row.activa!==undefined&&typeof row.activa!=='boolean')throw new Error('Estado de rutina inválido.');
  return pick(row,['id','nombre','descripcion','ejercicios','activa']);
 }
 if(kind==='ejercicios_personalizados'){
  if(row.grupo!=null&&!text(row.grupo,200))throw new Error('Grupo inválido.');
  if(row.puntos_clave!=null&&(!Array.isArray(row.puntos_clave)||row.puntos_clave.length>50||row.puntos_clave.some(p=>!text(p,2000))))throw new Error('Indicaciones inválidas.');
  return pick(row,['id','nombre','grupo','descripcion','puntos_clave']);
 }
 throw new Error('Tipo de dato desconocido.');
}
export function validateBackup(body,userId){
 if(body?.format!=='fitsync-backup'||body.version!==1)throw new Error('Elegí un respaldo JSON de FitSync versión 1.');
 if(body.ownerId!==userId)throw new Error('Este respaldo pertenece a otra cuenta. Iniciá sesión con la cuenta original.');
 const result={format:body.format,version:1,ownerId:userId,createdAt:body.createdAt};
 for(const kind of ['rutinas','sesiones','ejercicios_personalizados']){
  if(!Array.isArray(body[kind])||body[kind].length>10000)throw new Error('Contenido o cantidad de registros inválidos.');
  result[kind]=body[kind].map(row=>cleanRecord(kind,row));
  if(new Set(result[kind].map(r=>r.id)).size!==result[kind].length)throw new Error('El archivo contiene identificadores repetidos.');
 }
 const p=body.preferencias||{};if(typeof p!=='object'||Array.isArray(p))throw new Error('Preferencias inválidas.');
 result.preferencias={};
 for(const [key,min,max] of [['metaSemanal',1,7],['descansoDefault',0,3600],['pesoCorporalKg',1,1000],['barraKg',0,500]]){
  if(p[key]!==undefined){if(typeof p[key]!=='number'||!Number.isFinite(p[key])||p[key]<min||p[key]>max)throw new Error('Preferencias fuera de rango.');result.preferencias[key]=p[key];}
 }
 if(p.ordenRutinas!==undefined){if(!Array.isArray(p.ordenRutinas)||p.ordenRutinas.length>10000||p.ordenRutinas.some(id=>!uuid.test(id)))throw new Error('Orden de rutinas inválido.');result.preferencias.ordenRutinas=p.ordenRutinas;}
 return result;
}
