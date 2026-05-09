const fs = require('fs');
const path = require('path');

const imagePath = 'C:/Users/Usuario/.gemini/antigravity/brain/99866500-764b-4d56-8d21-b36272da2b07/media__1778331392648.jpg';
const landingPagePath = 'c:/SOLARA-CONNECT-OFICIAL/src/LandingPage.tsx';

// Lê a imagem e converte para base64
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = imageBuffer.toString('base64');
const dataUrl = `data:image/jpeg;base64,${base64Image}`;

// Lê o arquivo da Landing Page
let content = fs.readFileSync(landingPagePath, 'utf8');

// Substitui o src="" pela nova imagem
content = content.replace(/src=\"\"/, `src="${dataUrl}"`);

fs.writeFileSync(landingPagePath, content, 'utf8');
console.log('Nova imagem injetada com sucesso!');
