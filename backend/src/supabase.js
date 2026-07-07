import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
// Usamos la service role key: este backend ya valida el login por su cuenta
// (ver middleware/auth.middleware.js), así que necesita saltarse RLS para
// poder leer/escribir en nombre del usuario ya verificado. La anon key
// queda como fallback por compatibilidad, pero con RLS activado (PASO 5
// del SQL) los inserts/updates fallarán si usás la anon key.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Falta la variable de entorno SUPABASE_URL para inicializar el cliente de Supabase.');
}

if (!supabaseServiceKey) {
  throw new Error('Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_ANON_KEY) para inicializar el cliente de Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
