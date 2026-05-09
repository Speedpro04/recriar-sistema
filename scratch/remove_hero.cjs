const fs = require('fs');
const filePath = 'c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove qualquer conteúdo base64 dentro do src da imagem do hero
const regex = /src="data:image\/png;base64,[^"]+"/;
content = content.replace(regex, 'src=""');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Imagem removida com sucesso da primeira dobra.');
