# Estágio 1: Build da aplicação
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio 2: Produção
FROM node:20-alpine

WORKDIR /app

# Copiar apenas o necessário para produção
COPY package*.json ./
COPY server.js ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar build do estágio anterior
COPY --from=builder /app/dist ./dist

# Expor a porta
EXPOSE 8080

# Comando para iniciar o servidor
CMD ["node", "server.js"]
