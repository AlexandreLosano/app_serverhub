# 📋 Planejamento: Server Hub v2.0

## 🎯 Objetivo

Modernizar o Server Hub atual (vanilla JS) para uma stack profissional containerizada com React + Node.js + MongoDB, mantendo todas as funcionalidades atuais e adicionando interface de gerenciamento (CRUD) via modal.

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────┐
│  Docker Network: server-hub-network             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐           │
│  │  Frontend    │  │  Backend     │           │
│  │  (React)     │  │  (Node.js)   │           │
│  │  Port: 5173  │  │  Port: 3000  │           │
│  └──────┬───────┘  └──────┬───────┘           │
│         │                  │                    │
│         └──────────┬───────┘                    │
│                    │                            │
│         ┌──────────▼────────────┐              │
│         │  MongoDB (Isolado)    │              │
│         │  Port: 27017          │              │
│         │  Volume: mongo-data   │              │
│         └───────────────────────┘              │
│                                                 │
└─────────────────────────────────────────────────┘

Acesso:
- Frontend: http://192.168.15.15:5173
- Backend API: http://192.168.15.15:30001/api ✅ (porta customizada)
- MongoDB: localhost:27017 (acessível por outras apps)
```

---

## 📦 Stack Tecnológica

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Estilização:** TailwindCSS ✅ **(decisão confirmada)**
- **Form Management:** React Hook Form
- **Validação:** Zod
- **HTTP Client:** Axios
- **State Management:** React Context API (ou Zustand se necessário)
- **Drag-and-Drop:** dnd-kit ✅ **(decisão confirmada)**

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **ODM:** Mongoose
- **Validação:** Joi ou Zod
- **CORS:** cors middleware
- **Environment:** dotenv

### Database
- **Banco:** MongoDB 7 ✅ **(já configurado em ser_mongodb)**
- **Database Name:** `server_hub` ✅ **(decisão confirmada - manter atual)**
- **Collections:** `links`, `tags`, `categorias`, `variables` ✅ **(português confirmado)**
- **Container:** Docker isolado em `/home/alosano/projetos/ser_mongodb`
- **Porta:** 27017 (exposta para outras aplicações)
- **Credenciais:** admin/admin
- **Conexão:** `mongodb://admin:admin@192.168.15.15:27017/server_hub?authSource=admin`

### DevOps
- **Containerização:** Docker + Docker Compose
- **Redes:** Bridge network + shared network (futuras apps)
- **Volumes:** Desenvolvimento (HMR) + Produção (build)

---

## 📂 Estrutura de Pastas

**IMPORTANTE:** O novo projeto será criado em `ser_new_server_hub` para preservar o atual funcionando.

```
ser_new_server_hub/              # ← NOVO PROJETO
├── docker-compose.yml           # Orquestração completa
├── .env.example                 # Template de variáveis
├── .env                         # Variáveis (gitignored)
├── .gitignore
├── README.md
│
├── frontend/                    # React App
│   ├── src/
│   │   ├── components/
│   │   │   ├── LinkCard/
│   │   │   │   ├── LinkCard.jsx
│   │   │   │   └── LinkCard.module.css
│   │   │   ├── LinkModal/
│   │   │   │   ├── LinkModal.jsx
│   │   │   │   └── LinkModal.module.css
│   │   │   ├── SearchBar/
│   │   │   │   └── SearchBar.jsx
│   │   │   ├── FilterBar/
│   │   │   │   └── FilterBar.jsx
│   │   │   ├── ThemeToggle/
│   │   │   │   └── ThemeToggle.jsx
│   │   │   └── Header/
│   │   │       └── Header.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useLinks.js      # Fetch/CRUD links
│   │   │   ├── useTheme.js      # Theme management
│   │   │   └── useFilters.js    # Filtros/busca
│   │   │
│   │   ├── services/
│   │   │   └── api.js           # Axios config + endpoints
│   │   │
│   │   ├── contexts/
│   │   │   └── ThemeContext.jsx # Context API (tema)
│   │   │
│   │   ├── utils/
│   │   │   ├── variableSubstitution.js
│   │   │   └── constants.js     # Categorias, cores, etc
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
│
├── backend/                     # Node.js API
│   ├── src/
│   │   ├── models/
│   │   │   ├── Link.js          # Mongoose schema
│   │   │   ├── Category.js
│   │   │   ├── Tag.js
│   │   │   └── Variable.js
│   │   │
│   │   ├── routes/
│   │   │   ├── links.js         # CRUD endpoints
│   │   │   ├── categories.js
│   │   │   ├── tags.js
│   │   │   └── variables.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── linkController.js
│   │   │   ├── categoryController.js
│   │   │   └── tagController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   ├── validation.js
│   │   │   └── auth.js (futuro)
│   │   │
│   │   ├── config/
│   │   │   └── database.js      # MongoDB connection
│   │   │
│   │   ├── scripts/
│   │   │   └── migrate.js       # Migra links.json → Mongo
│   │   │
│   │   └── server.js            # Entry point
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── package-lock.json
│
├── mongodb/                     # Config MongoDB
│   ├── init-mongo.js            # Script de inicialização
│   └── mongod.conf              # Config customizada (opcional)
│
└── legacy/                      # Código antigo (backup)
    ├── index.html
    ├── app.js
    ├── styles.css
    ├── links.json
    └── server.js
```

---

## 🗃️ Modelo de Dados (MongoDB)

**Database:** `server_hub` ✅
**Collections criadas:** ✅ `links`, `tags`, `categorias`, `variables`

### Collection: `links`

```javascript
{
  _id: ObjectId,
  nome: String,              // "Airflow"
  endereco: String,          // "http://{{SERVER_IP}}:8080"
  observacoes: String,       // Descrição do serviço
  credenciais: String,       // "user: admin | senha: xxx" (criptografado depois)
  categoria: ObjectId,       // Ref → categorias ✅ (português)
  icone: String,             // Emoji
  cor: String,               // Hex color
  tags: [ObjectId],          // Refs → tags
  ordem: Number,             // Para drag-and-drop
  ativo: Boolean,            // Se o link está ativo
  criadoEm: Date,            // ✅ (português)
  atualizadoEm: Date         // ✅ (português)
}
```

### Collection: `categorias` ✅ (português - mantido)

```javascript
{
  _id: ObjectId,
  nome: String,              // "Server", "Note", "Externo"
  descricao: String,         // Descrição da categoria
  icone: String,             // Ícone padrão (emoji)
  cor: String,               // Cor padrão da categoria (hex)
  ordem: Number              // Ordem de exibição
}
```

**Dados iniciais:**
- Server 🖥️ (#4CAF50)
- Note 💻 (#2196F3)
- Externo 🌐 (#FF9800)

### Collection: `tags`

```javascript
{
  _id: ObjectId,
  nome: String,              // "docker", "database", "workflow"
  descricao: String,         // Descrição da tag
  cor: String,               // Cor em hexadecimal
  usoContador: Number        // Número de vezes que a tag é usada
}
```

**Dados iniciais:** database, admin, monitoring, docker, api, media, automation, storage

### Collection: `variables` ✅ (nova - criada)

```javascript
{
  _id: ObjectId,
  chave: String,             // "SERVER_IP", "NOTE_IP", "LOCALHOST" (unique)
  valor: String,             // "192.168.15.15"
  descricao: String,         // Descrição da variável
  criadoEm: Date,            // ✅ (português)
  atualizadoEm: Date         // ✅ (português)
}
```

**Dados iniciais:**
- SERVER_IP = 192.168.15.15
- NOTE_IP = 192.168.2.183
- LOCALHOST = localhost

---

## 🔌 API Endpoints

### Links

```
GET    /api/links                    # Lista todos os links
GET    /api/links/:id                # Busca link por ID
POST   /api/links                    # Cria novo link
PUT    /api/links/:id                # Atualiza link
DELETE /api/links/:id                # Remove link
PATCH  /api/links/reorder            # Atualiza ordem (drag-and-drop)

# Filtros
GET    /api/links?categoria=Server   # Filtra por categoria
GET    /api/links?tags=docker,db     # Filtra por tags
GET    /api/links?search=airflow     # Busca por nome/descrição
```

### Categories

```
GET    /api/categories               # Lista todas as categorias
GET    /api/categories/:id           # Busca categoria por ID
POST   /api/categories               # Cria nova categoria
PUT    /api/categories/:id           # Atualiza categoria
DELETE /api/categories/:id           # Remove categoria
```

### Tags

```
GET    /api/tags                     # Lista todas as tags
GET    /api/tags/:id                 # Busca tag por ID
POST   /api/tags                     # Cria nova tag
PUT    /api/tags/:id                 # Atualiza tag
DELETE /api/tags/:id                 # Remove tag
```

### Variables

```
GET    /api/variables                # Lista todas as variáveis
GET    /api/variables/:chave         # Busca variável por chave
POST   /api/variables                # Cria nova variável
PUT    /api/variables/:chave         # Atualiza variável
DELETE /api/variables/:chave         # Remove variável
```

---

## 🎨 Funcionalidades Frontend

### ⚠️ IMPORTANTE: Design dos Cards - NÃO MODIFICAR

**Os cards dos links estão perfeitos visualmente e NÃO devem ser alterados!**

Características atuais que devem ser **mantidas identicamente:**
- Layout do card (tamanho, proporções, espaçamento)
- Esquema de cores dos cards
- Ícones (emojis) e posicionamento
- Tipografia e hierarquia de informações
- Animações de hover
- Toggle de credenciais (ícone de olho)
- Grid responsivo (5→4→3→2→1 colunas)

### Melhorias Visuais (Escopo Permitido)

As melhorias visuais devem focar em:
- ✅ **Modal CRUD** (novo componente)
- ✅ **Filtros e busca** (melhorar UX)
- ✅ **Header/navegação** (pode melhorar)
- ✅ **Animações de drag-and-drop**
- ✅ **Loading states e skeleton loaders**
- ✅ **Toast notifications**
- ✅ **Responsividade geral** (manter grid dos cards)

### Dashboard Principal
- ✅ Grid de cards responsivo (5→4→3→2→1 colunas) **[MANTER ATUAL]**
- ✅ Live clock com data/hora
- ✅ Toggle de tema (Light/Dark/Auto)
- ✅ Busca em tempo real
- ✅ Filtros por categoria e tags
- ✅ Drag-and-drop para reordenar
- ✅ Click no card abre serviço em nova aba **[MANTER ATUAL]**
- ✅ Toggle para mostrar/ocultar credenciais **[MANTER ATUAL]**

### Modal de CRUD
- ✅ **Criar novo link:**
  - Nome (input text, obrigatório)
  - URL (input URL, obrigatório, suporta variáveis {{VAR}})
  - Categoria (select, obrigatório, lista fixa)
  - Tags (multi-select, criar nova ou selecionar existente)
  - Ícone (emoji picker ou input text)
  - Cor (color picker)
  - Credenciais (textarea, opcional, aviso de segurança)
  - Observações (textarea, opcional)

- ✅ **Editar link existente:**
  - Botão "Editar" em cada card
  - Mesmo formulário, campos pré-preenchidos

- ✅ **Deletar link:**
  - Botão "Deletar" em cada card
  - Modal de confirmação

### Validações
- Nome: mínimo 3 caracteres
- URL: formato válido, HTTP/HTTPS
- Categoria: obrigatória, lista fixa
- Tags: máximo 10 por link
- Cor: formato hex válido
- Credenciais: aviso de plaintext (criptografia futura)

---

## 🐳 Docker Configuration

### docker-compose.yml

**NOTA:** MongoDB já está rodando isolado em `/home/alosano/projetos/ser_mongodb`

```yaml
version: '3.8'

services:
  # MongoDB NÃO está aqui - usa o container isolado em ser_mongodb
  # Conexão: mongodb://admin:admin@192.168.15.15:27017/server_hub?authSource=admin

  backend:
    build: ./backend
    container_name: new-server-hub-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGO_URI: mongodb://admin:admin@192.168.15.15:27017/server_hub?authSource=admin
      PORT: 3000
    ports:
      - "30001:3000"  # Host:Container - Acesso externo na 30001, interno na 3000
    volumes:
      - ./backend/src:/app/src  # HMR em desenvolvimento
    networks:
      - server-hub-network
    extra_hosts:
      - "host.docker.internal:host-gateway"  # Acesso ao MongoDB do host

  frontend:
    build: ./frontend
    container_name: new-server-hub-frontend
    restart: unless-stopped
    environment:
      VITE_API_URL: http://192.168.15.15:30001
    ports:
      - "5173:5173"
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src  # HMR em desenvolvimento
    networks:
      - server-hub-network

networks:
  server-hub-network:
    driver: bridge
```

### .env.example

```env
# MongoDB (externo - ser_mongodb)
MONGO_URI=mongodb://admin:admin@192.168.15.15:27017/server_hub?authSource=admin

# Backend (porta interna do container)
NODE_ENV=development
PORT=3000

# Frontend (usa porta externa do host)
VITE_API_URL=http://192.168.15.15:30001
```

---

## 🚀 Roadmap de Implementação

### **Fase 1: Setup Inicial** (Dia 1)

**Objetivo:** Preparar ambiente e estrutura base em `ser_new_server_hub`

- [x] MongoDB isolado configurado ✅ (em `/home/alosano/projetos/ser_mongodb`)
- [x] Database `server_hub` criado ✅
- [x] Coleções `links`, `tags`, `categorias`, `variables` criadas ✅
- [ ] Criar novo diretório `ser_new_server_hub`
- [ ] Criar estrutura de pastas completa
- [ ] Copiar código atual para referência em `legacy/`
- [ ] Criar `.gitignore` atualizado
- [ ] Criar `.env.example` e `.env`
- [ ] Setup inicial do Docker Compose (sem MongoDB - usar externo)

**Comandos:**
```bash
cd /home/alosano/projetos
mkdir -p ser_new_server_hub
cd ser_new_server_hub
mkdir -p frontend/src/{components,hooks,services,contexts,utils}
mkdir -p backend/src/{models,routes,controllers,middleware,config,scripts}
mkdir -p legacy

# Copiar código atual como referência
cp ../ser_server-hub/{index.html,app.js,styles.css,links.json,server.js} legacy/
```

---

### **Fase 2: Backend - Setup e Models** (Dia 1-2)

**Objetivo:** Configurar Express + Mongoose + Models

- [ ] Inicializar backend (`npm init`)
- [ ] Instalar dependências:
  ```bash
  npm install express mongoose cors dotenv
  npm install -D nodemon
  ```
- [ ] Criar `server.js` básico
- [ ] Configurar conexão MongoDB (`config/database.js`)
- [ ] Criar Mongoose models:
  - [ ] `Link.js`
  - [ ] `Category.js`
  - [ ] `Tag.js`
  - [ ] `Variable.js`
- [ ] Testar conexão com MongoDB

**Validação:** Conexão bem-sucedida no console

---

### **Fase 3: Backend - API REST** (Dia 2-3)

**Objetivo:** Implementar todos os endpoints

- [ ] Criar controllers:
  - [ ] `linkController.js` (CRUD completo)
  - [ ] `categoryController.js`
  - [ ] `tagController.js`
  - [ ] `variableController.js`
- [ ] Criar routes:
  - [ ] `/api/links`
  - [ ] `/api/categories`
  - [ ] `/api/tags`
  - [ ] `/api/variables`
- [ ] Middleware de validação (Joi ou Zod)
- [ ] Middleware de error handling
- [ ] CORS configurado
- [ ] Testar endpoints com Postman/Insomnia

**Validação:** Todos os endpoints funcionando (GET, POST, PUT, DELETE)

---

### **Fase 4: Script de Migração** (Dia 3)

**Objetivo:** Migrar dados do `links.json` para MongoDB

- [ ] Criar `scripts/migrate.js`
- [ ] Ler `legacy/links.json`
- [ ] Migrar variáveis
- [ ] Migrar categorias
- [ ] Migrar tags
- [ ] Migrar links (com referências)
- [ ] Executar migração
- [ ] Validar dados no MongoDB Compass

**Comandos:**
```bash
cd backend
npm run migrate
```

**Validação:** Dados no MongoDB idênticos ao JSON

---

### **Fase 5: Frontend - Setup React** (Dia 3-4)

**Objetivo:** Configurar Vite + React base

- [ ] Criar projeto Vite:
  ```bash
  npm create vite@latest frontend -- --template react
  ```
- [ ] Instalar dependências:
  ```bash
  npm install axios react-hook-form zod @hookform/resolvers
  npm install -D tailwindcss postcss autoprefixer  # (opcional)
  ```
- [ ] Configurar Tailwind (se escolhido)
- [ ] Criar estrutura de pastas
- [ ] Configurar Axios (`services/api.js`)
- [ ] Criar constants (`utils/constants.js`)
- [ ] Setup ThemeContext

**Validação:** Vite rodando, página inicial renderizando

---

### **Fase 6: Frontend - Componentes Base** (Dia 4-5)

**Objetivo:** Criar componentes reutilizáveis

- [ ] `Header.jsx` (clock + título + theme toggle)
- [ ] `ThemeToggle.jsx`
- [ ] `SearchBar.jsx`
- [ ] `FilterBar.jsx` (categoria + tags)
- [ ] `LinkCard.jsx` (card de serviço)
- [ ] Layout responsivo (grid)

**Validação:** UI básica funcionando (sem dados ainda)

---

### **Fase 7: Frontend - Integração API** (Dia 5-6)

**Objetivo:** Conectar frontend com backend

- [ ] Hook `useLinks.js`:
  - [ ] `fetchLinks()`
  - [ ] `createLink()`
  - [ ] `updateLink()`
  - [ ] `deleteLink()`
  - [ ] `reorderLinks()`
- [ ] Hook `useFilters.js` (filtros locais)
- [ ] Renderizar cards com dados reais
- [ ] Implementar busca/filtros
- [ ] Substituição de variáveis (`{{SERVER_IP}}`)
- [ ] Toggle de credenciais

**Validação:** Dashboard completo funcionando

---

### **Fase 8: Frontend - Modal CRUD** (Dia 6-7)

**Objetivo:** Implementar modal de gerenciamento

- [ ] `LinkModal.jsx` (componente modal)
- [ ] React Hook Form setup
- [ ] Validação com Zod
- [ ] Formulário completo:
  - [ ] Inputs (nome, URL, observações)
  - [ ] Selects (categoria)
  - [ ] Multi-select (tags)
  - [ ] Color picker
  - [ ] Emoji picker (ou input simples)
  - [ ] Textarea (credenciais)
- [ ] Modo CREATE vs EDIT
- [ ] Botão "Deletar" com confirmação
- [ ] Botão "Adicionar Link" (floating action button)
- [ ] Tratamento de erros

**Validação:** CRUD completo via modal funcionando

---

### **Fase 9: Frontend - Features Avançadas** (Dia 7-8)

**Objetivo:** Implementar funcionalidades extras

- [ ] Drag-and-drop com **dnd-kit** ✅ (decisão confirmada)
- [ ] Persistência de ordem no backend
- [ ] Animações/transições
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Toast notifications (react-hot-toast)

**Instalação:**
```bash
cd frontend
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Validação:** Todas as features do legacy + novas funcionando

---

### **Fase 10: Dockerização** (Dia 8-9)

**Objetivo:** Containerizar tudo

- [ ] **Backend Dockerfile:**
  ```dockerfile
  FROM node:20-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  EXPOSE 3000
  CMD ["npm", "start"]
  ```

- [ ] **Frontend Dockerfile:**
  ```dockerfile
  FROM node:20-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  EXPOSE 5173
  CMD ["npm", "run", "dev", "--", "--host"]
  ```

- [ ] **Docker Compose completo**
- [ ] Testar build e run
- [ ] Configurar volumes (HMR)
- [ ] Testar comunicação entre containers

**Comandos:**
```bash
docker-compose up --build
```

**Validação:** Tudo rodando em containers, HMR funcionando

---

### **Fase 11: Testes e Refinamentos** (Dia 9-10)

**Objetivo:** Garantir qualidade

- [ ] Testar em diferentes resoluções (mobile, tablet, desktop)
- [ ] Testar todos os fluxos CRUD
- [ ] Testar filtros/busca
- [ ] Testar drag-and-drop
- [ ] Testar persistência (reiniciar containers)
- [ ] Corrigir bugs encontrados
- [ ] Melhorar UX/UI
- [ ] Code review

**Validação:** Zero bugs, UX polida

---

### **Fase 12: Documentação** (Dia 10)

**Objetivo:** Documentar projeto

- [ ] README.md completo:
  - [ ] Descrição do projeto
  - [ ] Stack utilizada
  - [ ] Setup (como rodar)
  - [ ] Comandos úteis
  - [ ] Estrutura de pastas
  - [ ] API documentation
  - [ ] Screenshots
- [ ] Comentários no código
- [ ] `.env.example` documentado
- [ ] API documentation (Swagger? opcional)

**Validação:** Outro dev consegue rodar o projeto só lendo o README

---

## 🎯 Funcionalidades Mantidas do Legacy

- ✅ Grid responsivo de cards
- ✅ Live clock
- ✅ Temas (Light/Dark/Auto baseado em horário)
- ✅ Busca em tempo real
- ✅ Filtros por categoria e tags
- ✅ Drag-and-drop para reordenar
- ✅ Toggle de credenciais (eye icon)
- ✅ Abertura de links em nova aba
- ✅ Substituição de variáveis (`{{SERVER_IP}}`)
- ✅ Emojis como ícones
- ✅ Cores customizadas por card

---

## 🆕 Funcionalidades Novas

- ✅ **Modal de CRUD** (criar/editar/deletar links)
- ✅ **Validação de formulários** (Zod + React Hook Form)
- ✅ **API REST completa** (backend profissional)
- ✅ **Persistência em MongoDB** (banco de verdade)
- ✅ **Containerização completa** (Docker Compose)
- ✅ **Estrutura escalável** (monorepo organizado)
- ✅ **Gerenciamento de variáveis** (via API)
- ✅ **Gerenciamento de categorias/tags** (admin)
- ✅ **Loading/error states** (UX melhorada)
- ✅ **Toast notifications** (feedback visual)

---

## 🔮 Melhorias Futuras (Backlog)

### Curto Prazo
- [ ] Autenticação simples (login/senha)
- [ ] Criptografia de credenciais (bcrypt)
- [ ] Exportar/importar JSON (backup)
- [ ] Dark mode manual (override do auto)
- [ ] Pesquisa avançada (regex, multiple fields)

### Médio Prazo
- [ ] Dashboard de analytics (links mais acessados)
- [ ] Histórico de alterações (audit log)
- [ ] Multi-usuário (permissões)
- [ ] Integração com OAuth (Google, GitHub)
- [ ] PWA (Progressive Web App)
- [ ] Notificações (serviço down?)

### Longo Prazo
- [ ] Health check automático dos serviços
- [ ] Integração com Prometheus/Grafana
- [ ] CI/CD (GitHub Actions)
- [ ] Deploy automatizado
- [ ] API para outras aplicações
- [ ] Mobile app (React Native?)

---

## 📊 Métricas de Sucesso

- ✅ Todos os links do legacy migrados
- ✅ Performance igual ou melhor (tempo de carregamento)
- ✅ CRUD completo funcionando via modal
- ✅ Zero bugs críticos
- ✅ Responsivo em todos os devices
- ✅ MongoDB acessível por outras apps (porta 27017)
- ✅ Documentação completa
- ✅ Código limpo e organizado

---

## 🛠️ Comandos Úteis

### Desenvolvimento

```bash
# Subir tudo
docker-compose up

# Subir em background
docker-compose up -d

# Rebuild
docker-compose up --build

# Ver logs
docker-compose logs -f [serviço]

# Parar tudo
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

### MongoDB

**MongoDB está em container separado:** `/home/alosano/projetos/ser_mongodb`

```bash
# Acessar MongoDB
cd /home/alosano/projetos/ser_mongodb
docker exec -it mongodb mongosh -u admin -p admin --authenticationDatabase admin

# Verificar coleções do server_hub
docker exec mongodb mongosh -u admin -p admin --authenticationDatabase admin server_hub --eval "db.getCollectionNames()"

# Backup
docker exec mongodb mongodump --username admin --password admin --authenticationDatabase admin --db server_hub --out /data/db/backup

# Restore
docker exec mongodb mongorestore --username admin --password admin --authenticationDatabase admin --db server_hub /data/db/backup/server_hub

# Ver status
cd /home/alosano/projetos/ser_mongodb
docker compose ps
```

### Backend

```bash
# Rodar migração
cd backend
npm run migrate

# Dev mode (com nodemon)
npm run dev

# Production
npm start
```

### Frontend

```bash
cd frontend

# Dev mode
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

---

## 🔐 Segurança (Checklist)

- [ ] Variáveis sensíveis em `.env` (não commitadas)
- [ ] `.gitignore` configurado corretamente
- [ ] Credenciais MongoDB fortes
- [ ] CORS configurado (apenas origens permitidas)
- [ ] Validação de inputs (backend + frontend)
- [ ] Rate limiting (implementar depois)
- [ ] HTTPS (implementar depois com Nginx)
- [ ] Autenticação (implementar depois)
- [ ] Criptografia de credenciais (implementar depois)

---

## 📝 Notas Importantes

1. **MongoDB EXTERNO:** Container isolado em `/home/alosano/projetos/ser_mongodb`
   - Database: `server_hub`
   - Porta 27017 acessível para outras aplicações
   - Credenciais: admin/admin
   - 4 coleções: links, tags, categorias, variables ✅

2. **Projeto SEPARADO:** Novo em `ser_new_server_hub`, preserva `ser_server-hub` atual

3. **Design dos Cards:** NÃO modificar! Visual atual perfeito ✅

4. **Decisões Técnicas Confirmadas:**
   - Database: `server_hub` (português)
   - CSS: TailwindCSS
   - Drag-drop: dnd-kit
   - Collections: português (categorias, não categories)

5. **HMR funcionando:** Volumes mapeados em desenvolvimento

6. **Legacy preservado:** Código original copiado para `legacy/`

7. **Migration script:** Dados do `links.json` migrados para MongoDB

8. **Sem Nginx:** Por enquanto, cada serviço em sua porta

9. **Portas Customizadas:**
   - Acesso externo (navegador): Backend na porta **30001**
   - Porta interna do container: 3000 (padrão Node.js)
   - Mapeamento: `30001:3000` (evita conflitos no host)

---

## 🤝 Contribuição

Este é um projeto pessoal de estudos, mas melhorias são bem-vindas:

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Projeto pessoal para estudos e gerenciamento de servidor doméstico.

---

**Última atualização:** 2025-11-13
**Versão do planejamento:** 1.0
**Status:** 🚧 Em implementação

---

## ✅ Checklist de Pré-requisitos

Antes de começar a implementação:

**Infraestrutura:**
- [x] MongoDB rodando em `/home/alosano/projetos/ser_mongodb` ✅
- [x] Database `server_hub` criado ✅
- [x] 4 coleções criadas (links, tags, categorias, variables) ✅
- [x] Mongo Express rodando (http://192.168.15.15:8083) ✅
- [ ] Docker e Docker Compose instalados
- [ ] Node.js 20 LTS instalado

**Desenvolvimento:**
- [ ] Git configurado
- [ ] Editor de código pronto (VSCode recomendado)
- [ ] Postman/Insomnia instalado (para testar API)

**Decisões Confirmadas:**
- [x] Database: `server_hub` (manter atual) ✅
- [x] Collections em português ✅
- [x] CSS Framework: TailwindCSS ✅
- [x] Drag-drop: dnd-kit ✅
- [x] Cards NÃO serão modificados visualmente ✅
- [x] Novo projeto em `ser_new_server_hub` ✅

**Pronto? Bora começar a Fase 1! 🚀**
