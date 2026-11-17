import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { supabase } from '../supabase.js';
import { usuarioModel } from '../models/usuario.model.js';
import { cleanRecord, validateBackup } from '../utils/backup.js';
const router=Router();router.use(requireAuth);
async function allRows(table,userId){let rows=[];for(let offset=0;;offset+=500){const {data,error}=await supabase.from(table).select('*').eq('usuario_id',userId).order('id').range(offset,offset+499);if(error)throw error;rows.push(...data);if(data.length<500)return rows;}}
router.get('/',async(req,res)=>{try{
 const [rutinas,sesiones,ejercicios,profile]=await Promise.all([allRows('rutinas',req.usuarioId),allRows('sesiones',req.usuarioId),allRows('ejercicios_personalizados',req.usuarioId),usuarioModel.getById(req.usuarioId)]);
 const data={format:'fitsync-backup',version:1,ownerId:req.usuarioId,createdAt:new Date().toISOString(),rutinas:rutinas.map(r=>cleanRecord('rutinas',r)),sesiones:sesiones.map(r=>cleanRecord('sesiones',r)),ejercicios_personalizados:ejercicios.map(r=>cleanRecord('ejercicios_personalizados',r)),preferencias:profile?.preferencias||{}};
 res.json({success:true,data});
}catch{res.status(500).json({message:'No se pudo generar un respaldo completo. Reintentá cuando tengas conexión.'});}});
router.post('/validate',async(req,res)=>{try{res.json({success:true,data:validateBackup(req.body,req.usuarioId)});}catch(e){res.status(400).json({message:e.message});}});
router.post('/restore',async(req,res)=>{
 const {ownerId,kind,records}=req.body||{};
 if(ownerId!==req.usuarioId||!['rutinas','sesiones','ejercicios_personalizados'].includes(kind)||!Array.isArray(records)||records.length>10)return res.status(400).json({message:'Lote de restauración inválido.'});
 let clean;try{clean=records.map(row=>cleanRecord(kind,row));}catch(e){return res.status(400).json({message:e.message});}
 let added=0,skipped=0;
 try{for(const record of clean){
  const {data:existing,error:readError}=await supabase.from(kind).select('id').eq('id',record.id).eq('usuario_id',req.usuarioId).maybeSingle();if(readError)throw readError;if(existing){skipped++;continue;}
  if(kind==='sesiones'&&record.rutina_id){const {data:r,error}=await supabase.from('rutinas').select('id').eq('id',record.rutina_id).eq('usuario_id',req.usuarioId).maybeSingle();if(error)throw error;if(!r)record.rutina_id=null;}
  const {data,error}=await supabase.from(kind).upsert({...record,usuario_id:req.usuarioId},{onConflict:'id',ignoreDuplicates:true}).select('id');if(error)throw error;
  if(data.length)added++;else {const {data:own,error:ownError}=await supabase.from(kind).select('id').eq('id',record.id).eq('usuario_id',req.usuarioId).maybeSingle();if(ownError||!own)throw new Error('Colisión de identificador');skipped++;}
 }res.json({success:true,data:{added,skipped}});
 }catch{res.status(500).json({message:'La restauración se interrumpió. Lo ya importado se conserva; podés reintentar el mismo archivo sin duplicarlo.',data:{added,skipped}});}
});
export default router;
