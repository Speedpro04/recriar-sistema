const fs = require('fs');
let content = fs.readFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx', 'utf8');
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
  fs.writeFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx', content, 'utf8');
  console.log('BOM removido!');
} else {
  console.log('Sem BOM.');
}
