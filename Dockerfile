# Build Stage
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:22-slim
WORKDIR /app
# Instala um servidor estático simples para servir o 'dist'
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 80
# Serve a pasta dist na porta 80
CMD ["serve", "-s", "dist", "-l", "80"]
