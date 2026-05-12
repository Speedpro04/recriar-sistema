const fs = require('fs');
const b64 = fs.readFileSync('c:/SOLARA-CONNECT-OFICIAL/hero_b64_real.txt', 'utf8').trim().replace(/[\r\n]/g, '');
let content = fs.readFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx', 'utf8');

// O alvo agora é o que estiver dentro do src do hero
// Como eu já injetei um base64 antes, vou usar regex para achar qualquer data:image
const regex = /src=\"data:image\/png;base64,[^\"]+\"/;
const replacement = `src="data:image/png;base64,${b64}"`;

content = content.replace(regex, replacement);
fs.writeFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx', content, 'utf8');
console.log('CORRECT Hero image injected successfully via Base64');
