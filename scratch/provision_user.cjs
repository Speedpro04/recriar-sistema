const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim())));

const supabaseUrl = envVars.VITE_SUPABASE_URL;
// We need the service key, let's grab it from backend/.env
const backendEnv = fs.readFileSync('backend/app/.env', 'utf8');
const backendVars = Object.fromEntries(backendEnv.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim())));
const supabaseKey = backendVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function provision() {
  const email = 'wineatlas77@gmail.com';
  console.log(`Buscando auth_id para ${email}...`);
  
  const { data: { users }, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) return console.error('Erro Auth:', authErr);
  
  const targetUser = users.find(u => u.email === email);
  if (!targetUser) return console.error('Usuário não encontrado no Supabase Auth!');
  
  const authId = targetUser.id;
  console.log('Auth ID encontrado:', authId);
  
  // Create clinic
  const { data: clinicData, error: clinicErr } = await supabase.from('clinics').insert([
    { name: 'Clínica Wine Atlas', email: email, subscription_status: 'active' }
  ]).select();
  
  if (clinicErr) return console.error('Erro ao criar clínica:', clinicErr);
  const clinicId = clinicData[0].id;
  console.log('Clínica criada:', clinicId);
  
  // Create user
  const { error: userErr } = await supabase.from('users').insert([
    { auth_id: authId, clinic_id: clinicId, full_name: 'Dr. Wine Atlas', email: email, role: 'admin' }
  ]);
  
  if (userErr) return console.error('Erro ao criar usuário:', userErr);
  console.log('Perfil provisionado com sucesso! Agora o login normal vai funcionar.');
}

provision();
