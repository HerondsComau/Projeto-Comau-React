/**
 * Configuração do Cliente Supabase
 *
 * Este arquivo configura a conexão com o Supabase (PostgreSQL na nuvem).
 * Usa variáveis de ambiente para segurança.
 */

import { createClient } from '@supabase/supabase-js';

// Validação das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Configuração do Supabase incompleta!');
  console.error('Certifique-se de que o arquivo .env existe e contém:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase environment variables');
}

// Configurações do cliente
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    enabled: import.meta.env.VITE_ENABLE_REALTIME === 'true'
  }
};

// Criar e exportar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig);

// Modo debug (apenas em desenvolvimento)
if (import.meta.env.VITE_DEV_MODE === 'true') {
  console.log('✅ Supabase client initialized');
  console.log('📍 URL:', supabaseUrl);
  console.log('🔑 Using anon key (safe for frontend)');
}

// Helper para verificar conexão
export async function checkConnection() {
  try {
    const { data, error } = await supabase
      .from('projetos')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;

    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error.message);
    return false;
  }
}

export default supabase;
