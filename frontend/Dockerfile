# Stage 1: Build base
FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json (se existir)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta do Vite
EXPOSE 5173

# Comando para desenvolvimento (com HMR)
CMD ["npm", "run", "dev"]
