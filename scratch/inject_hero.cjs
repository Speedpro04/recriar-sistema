const fs = require('fs');
const b64 = fs.readFileSync('c:/SOLARA-CONNECT-OFICIAL/hero_b64.txt', 'utf8').trim().replace(/[\r\n]/g, '');
let content = fs.readFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx', 'utf8');
const target = 'src="/hero_oficial.png"';
const replacement = `src="data:image/png;base64,${b64}"`;
content = content.replace(target, replacement);
fs.writeFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx', content, 'utf8');
console.log('Hero image injected successfully via Base64');
