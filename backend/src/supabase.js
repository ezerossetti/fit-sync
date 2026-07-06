import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Falta la variable de entorno SUPABASE_URL para inicializar el cliente de Supabase.');
}

if (!supabaseAnonKey) {
  throw new Error('Falta la variable de entorno SUPABASE_ANON_KEY para inicializar el cliente de Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
