const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validarSesion(body) {
  const fail = error => ({ error });
  if (!body || typeof body !== 'object') return fail('Sesión inválida.');
  if (body.id !== undefined && !uuid.test(body.id)) return fail('Identificador de sesión inválido.');
  if (typeof body.fecha !== 'string' || !Number.isFinite(Date.parse(body.fecha))) return fail('Fecha inválida.');
  if (typeof body.rutina_nombre !== 'string' || !body.rutina_nombre.trim() || body.rutina_nombre.length > 200) return fail('Indicá un nombre de sesión válido.');
  if (!Array.isArray(body.ejercicios) || !body.ejercicios.length || body.ejercicios.length > 100) return fail('La sesión debe incluir entre 1 y 100 ejercicios.');
  let volumen = 0;
  for (const ejercicio of body.ejercicios) {
    if (!ejercicio || typeof ejercicio.nombre !== 'string' || !ejercicio.nombre.trim() || ejercicio.nombre.length > 200 || !Array.isArray(ejercicio.series) || !ejercicio.series.length || ejercicio.series.length > 200) return fail('Revisá los ejercicios y sus series.');
    for (const serie of ejercicio.series) {
      if (!serie || typeof serie.peso !== 'number' || !Number.isFinite(serie.peso) || serie.peso < 0 || serie.peso > 5000 || !Number.isInteger(serie.reps) || serie.reps < 1 || serie.reps > 10000) return fail('Cada serie necesita un peso válido y repeticiones enteras mayores que cero.');
      if (serie.rpe != null && (typeof serie.rpe !== 'number' || !Number.isFinite(serie.rpe) || serie.rpe < 1 || serie.rpe > 10)) return fail('El esfuerzo debe estar entre 1 y 10.');
      volumen += serie.peso * serie.reps;
    }
  }
  for (const field of ['duracion_min', 'calorias_estimadas']) {
    if (body[field] != null && (typeof body[field] !== 'number' || !Number.isFinite(body[field]) || body[field] < 0)) return fail('Duración o calorías inválidas.');
  }
  if (body.notas != null && (typeof body.notas !== 'string' || body.notas.length > 10000)) return fail('Las notas son demasiado largas.');
  if (body.completada !== undefined && typeof body.completada !== 'boolean') return fail('Estado de sesión inválido.');
  return { data: { ...body, rutina_nombre: body.rutina_nombre.trim(), volumen_total: Math.round(volumen * 100) / 100 } };
}
