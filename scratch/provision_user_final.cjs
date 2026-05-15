const fs = require('fs');

const email = 'wineatlas77@gmail.com';
const supabaseUrl = 'https://mvqkelauwscxdwnzevtz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cWtlbGF1d3NjeGR3bnpldnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNTEyNCwiZXhwIjoyMDkzMjgxMTI0fQ.CBB5K916VuEpMOpAeQGe8g2Rm9V9J2NP5NRC_uacrwk';

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

        // 2. Verificar se clínica já existe
        const checkClinicRes = await fetch(`${supabaseUrl}/rest/v1/clinics?email=eq.${email}`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        const existingClinics = await checkClinicRes.json();
        let clinicId;

        if (existingClinics.length > 0) {
            clinicId = existingClinics[0].id;
            console.log('Clínica já existente ID:', clinicId);
        } else {
            // Criar Clínica
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
            clinicId = clinicData[0].id;
            console.log('Clínica criada ID:', clinicId);
        }

        // 3. Criar Perfil de Usuário
        const userRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ auth_id: authId, clinic_id: clinicId, name: 'Dr. Wine Atlas', email: email, role: 'admin' })
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
