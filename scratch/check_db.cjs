const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Carregar .env manualmente
const env = fs.readFileSync('.env', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim())));

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
  console.log('Verificando tabela users...');
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Erro ao acessar tabela users:', error.message);
    return;
  }

  if (data && data.length > 0) {
    const columns = Object.keys(data[0]);
    console.log('Colunas encontradas na tabela users:', columns.join(', '));
    
    const hasSpecialty = columns.includes('specialty');
    const hasCrm = columns.includes('crm');
    
    if (!hasSpecialty) console.log('ERRO: Coluna "specialty" NÃO existe.');
    if (!hasCrm) console.log('ERRO: Coluna "crm" NÃO existe.');
    
    if (hasSpecialty && hasCrm) {
      console.log('Estrutura de colunas OK.');
    }
  } else {
    console.log('Tabela users está vazia, tentando buscar estrutura por RPC ou metadados...');
  }
}

checkTable();
