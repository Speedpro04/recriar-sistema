const fs = require('fs');
let content = fs.readFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.old.tsx', 'utf8');

// The SEO fixes:
// 1. Replace the massive Base64 image with /hero_oficial.png
content = content.replace(/src=\"data:image\/png;base64,[^\"]+\"/, 'src="/hero_oficial.png"');

// 2. We can also add alt text if needed, but for now just making it compile is the priority.
// It had: alt="" originally.
content = content.replace(/<img\s+src="\/hero_oficial\.png"\s+alt=""/, '<img src="/hero_oficial.png" alt="Dashboard Solara Connect"');

fs.writeFileSync('c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx', content, 'utf8');
console.log('Restored LandingPage and replaced Base64 with clean image URL!');
