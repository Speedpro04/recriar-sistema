const fs = require('fs');
let content = fs.readFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx', 'utf8');

// Replace the massive Base64 image with /hero_oficial.png
content = content.replace(/src=\"data:image\/png;base64,[^\"]+\"/, 'src="/hero_oficial.png"');

fs.writeFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx', content, 'utf8');
console.log('Cleaned base64 image safely while preserving all accents!');
