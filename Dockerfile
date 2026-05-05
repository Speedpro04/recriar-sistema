# Estágio de Build
FROM node:22-slim AS build

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Executa o build do Vite
RUN npm run build

# Estágio de Produção
FROM node:22-slim

WORKDIR /app

# Copia as dependências de produção e o build
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

EXPOSE 4173

# Comando para rodar o preview do Vite (porta 4173)
CMD ["npm", "run", "preview", "--", "--host"]
