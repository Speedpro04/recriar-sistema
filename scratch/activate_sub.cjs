const fs = require('fs');

const email = 'wineatlas77@gmail.com';
const supabaseUrl = 'https://mvqkelauwscxdwnzevtz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cWtlbGF1d3NjeGR3bnpldnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNTEyNCwiZXhwIjoyMDkzMjgxMTI0fQ.CBB5K916VuEpMOpAeQGe8g2Rm9V9J2NP5NRC_uacrwk';

async function fixSubscription() {
    console.log(`Ativando assinatura para ${email}...`);

    try {
        // 1. Pegar a clínica desse email
        const clinicRes = await fetch(`${supabaseUrl}/rest/v1/clinics?email=eq.${email}`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        const clinics = await clinicRes.json();
        if (clinics.length === 0) return console.error('Clínica não encontrada.');
        const clinicId = clinics[0].id;

        // 2. Criar ou atualizar assinatura
        const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ 
                clinic_id: clinicId, 
                plan_id: '484b9854-1e39-45ca-8ac6-65535e855437', // Enterprise
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
        });

        if (subRes.ok) {
            console.log('Assinatura ativada com sucesso! O Dashboard deve carregar agora.');
        } else {
            console.error('Erro ao ativar assinatura:', await subRes.text());
        }

    } catch (err) {
        console.error('Erro fatal:', err);
    }
}

fixSubscription();
