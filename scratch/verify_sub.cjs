const fs = require('fs');
const supabaseUrl = 'https://mvqkelauwscxdwnzevtz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cWtlbGF1d3NjeGR3bnpldnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNTEyNCwiZXhwIjoyMDkzMjgxMTI0fQ.CBB5K916VuEpMOpAeQGe8g2Rm9V9J2NP5NRC_uacrwk';

async function verify() {
    const email = 'wineatlas77@gmail.com';
    const clinicRes = await fetch(`${supabaseUrl}/rest/v1/clinics?email=eq.${email}`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const clinics = await clinicRes.json();
    console.log('Clinics found:', JSON.stringify(clinics, null, 2));
    
    if (clinics.length > 0) {
        const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?clinic_id=eq.${clinics[0].id}`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const subs = await subRes.json();
        console.log('Subscriptions found:', JSON.stringify(subs, null, 2));
    }
}
verify();
