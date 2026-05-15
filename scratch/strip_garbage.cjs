const fs = require('fs');
let content = fs.readFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx', 'utf8');
const idx = content.indexOf('import');
if (idx > 0) {
    content = content.slice(idx);
    fs.writeFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx', content, 'utf8');
    console.log('Stripped everything before "import"!');
} else {
    console.log('import not found or already at index 0');
}
