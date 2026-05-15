const fs = require('fs');

const backendEnv = fs.readFileSync('backend/app/.env', 'utf8');
const backendVars = Object.fromEntries(backendEnv.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim())));
const supabaseUrl = backendVars.VITE_SUPABASE_URL;
const supabaseKey = backendVars.SUPABASE_SERVICE_ROLE_KEY;

const email = 'wineatlas77@gmail.com';

async function provision() {
    console.log(`Iniciando provisionamento para ${email}...`);

    try {
        // 1. Listar usuários para achar o ID
        const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        const { users } = await authRes.json();
        const targetUser = users.find(u => u.email === email);

        if (!targetUser) return console.error('Usuário não encontrado no Auth. Crie a conta primeiro no formulário.');

        const authId = targetUser.id;
        console.log('Auth ID:', authId);

        // 2. Criar Clínica
        const clinicRes = await fetch(`${supabaseUrl}/rest/v1/clinics`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ name: 'Clínica Wine Atlas', email: email, subscription_status: 'active' })
        });
        const clinicData = await clinicRes.json();
        const clinicId = clinicData[0].id;
        console.log('Clínica ID:', clinicId);

        // 3. Criar Perfil de Usuário
        const userRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ auth_id: authId, clinic_id: clinicId, full_name: 'Dr. Wine Atlas', email: email, role: 'admin' })
        });
        
        if (userRes.ok) {
            console.log('Provisionamento concluído! Pode tentar o login normal agora.');
        } else {
            console.error('Erro ao criar perfil:', await userRes.text());
        }

    } catch (err) {
        console.error('Erro fatal:', err);
    }
}

provision();
