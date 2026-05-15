const fs = require('fs');
const supabaseUrl = 'https://mvqkelauwscxdwnzevtz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cWtlbGF1d3NjeGR3bnpldnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNTEyNCwiZXhwIjoyMDkzMjgxMTI0fQ.CBB5K916VuEpMOpAeQGe8g2Rm9V9J2NP5NRC_uacrwk';

async function listPlans() {
    const res = await fetch(`${supabaseUrl}/rest/v1/plans`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const plans = await res.json();
    console.log(JSON.stringify(plans, null, 2));
}

listPlans();
