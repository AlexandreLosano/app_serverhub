FROM node:20-alpine

WORKDIR /app

# Ferramentas necessárias para compilar better-sqlite3 (módulo nativo)
RUN apk add --no-cache python3 make g++

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "run", "dev"]
