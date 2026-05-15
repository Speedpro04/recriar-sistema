const fs = require('fs');
let buf = fs.readFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx');
let text = buf.toString('utf8');
if (text.includes('\u0000')) {
    text = buf.toString('utf16le');
}
text = text.replace(/^\uFEFF/, '');
fs.writeFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx', text, 'utf8');
console.log('Cleaned file completely.');
