# Server Hub - Central de Serviços do Servidor

Uma página web moderna e responsiva para gerenciar os serviços do seu servidor com facilidade. Dashboard pessoal de acesso rápido aos serviços mais utilizados no Servidor Zorin.

## Características

- **Design Moderno**: Interface limpa e bonita com gradiente azul
- **Layout em Linhas**: Cards organizados verticalmente para fácil navegação
- **Sistema de Categorias**: Organize serviços por categorias com cores diferentes (Docker, Database, Workflow, Monitoring, Server)
- **Credenciais Protegidas**: Sistema de mostrar/ocultar credenciais com ícone de olho
- **Busca em Tempo Real**: Filtre serviços instantaneamente por nome, URL, descrição ou categoria
- **Totalmente Responsivo**: Funciona perfeitamente em desktop, tablet e celular
- **Zero Dependências**: HTML, CSS e JavaScript puro - sem frameworks necessários
- **Fácil Manutenção**: Adicione novos serviços editando apenas um arquivo JSON

## Estrutura do Projeto

```
los_server-hub/
├── index.html      # Estrutura HTML da página
├── styles.css      # Estilos e design
├── app.js          # Lógica JavaScript
├── links.json      # Configuração dos serviços (EDITE ESTE ARQUIVO)
└── README.md       # Este arquivo
```

## Como Usar

### 1. Visualizar a Página

#### Opção A: Abrir diretamente no navegador
```bash
firefox index.html
# ou
google-chrome index.html
```

#### Opção B: Usar servidor web local (recomendado)
```bash
cd /home/losano/projetos/los_server-hub
python3 -m http.server 3000
```
Depois acesse: http://localhost:3000

### 2. Adicionar Novos Serviços

Edite o arquivo `links.json` e adicione um novo objeto ao array:

```json
{
  "nome": "Nome do Serviço",
  "endereco": "http://192.168.15.15:8080",
  "observacoes": "Descrição breve do serviço",
  "credenciais": "user: usuario | senha: senha123",
  "categoria": "Docker",
  "icone": "🐳",
  "cor": "#13bef9"
}
```

#### Campos disponíveis:

- **nome** (obrigatório): Nome do serviço a ser exibido
- **endereco** (obrigatório): URL completa do serviço
- **observacoes** (obrigatório): Breve descrição
- **credenciais** (opcional): Credenciais de acesso (ficam ocultas por padrão)
- **categoria** (opcional): Categoria do serviço (Docker, Database, Workflow, Monitoring, Server)
- **icone** (opcional): Emoji a ser exibido (padrão: 🔗)
- **cor** (opcional): Cor de fundo do ícone em hexadecimal (padrão: #3b82f6)

### 3. Categorias e Cores

As categorias possuem cores automáticas:

- **Docker**: Azul claro (#e0f2fe com texto #0369a1)
- **Database**: Amarelo claro (#fef3c7 com texto #92400e)
- **Workflow**: Roxo claro (#e0e7ff com texto #3730a3)
- **Monitoring**: Verde claro (#f0fdf4 com texto #166534)
- **Server**: Rosa claro (#fce7f3 com texto #9f1239)

Para adicionar novas categorias com cores personalizadas, edite o arquivo `styles.css` na seção "Cores específicas para cada categoria".

## Funcionalidades

### Busca
Digite qualquer termo na barra de busca para filtrar serviços por:
- Nome
- URL
- Descrição
- Categoria

### Credenciais
Clique no ícone do olho para mostrar/ocultar credenciais. O ícone muda quando visível.

### Hover
Passe o mouse sobre um card para ver o efeito de destaque e movimento.

## Personalização

### Alterar o Gradiente de Fundo

Edite o arquivo `styles.css`, linha 9:
```css
background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%);
```

### Alterar Largura Máxima dos Cards

Edite o arquivo `styles.css`, linha 64:
```css
max-width: 1000px;
```

### Alterar Título e Subtítulo

Edite o arquivo `index.html`, linhas 12-13:
```html
<h1>🚀 Server Hub</h1>
<p class="subtitle">Central de Serviços - Servidor Zorin</p>
```

## Exemplos de Ícones

Alguns emojis úteis para seus serviços:

- 🌊 Airflow/Workflow
- 🐳 Docker/Containers
- 🐘 PostgreSQL
- 🍃 MongoDB
- 🔥 Firebase
- 📊 Grafana/Monitoring
- 🔍 Elasticsearch
- 🚀 Nginx/Server
- ⚙️ Jenkins/CI-CD
- 📺 Media Server
- 🗄️ Banco de Dados
- 🌐 Web Server
- 📡 API Gateway
- 🔐 Vault/Secrets

## Serviços Disponíveis

Atualmente configurados:
- **Airflow** (8080): Orquestração de workflows
- **Portainer** (9000): Gerenciamento Docker
- **PostgreSQL** (5432): Banco de dados

## Tecnologias Utilizadas

- HTML5
- CSS3 (Flexbox, Animations, Media Queries)
- JavaScript ES6+ (Fetch API, Arrow Functions, Template Literals)

## Compatibilidade

Testado e funcionando em:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Diferenças da versão React

Esta é uma versão HTML pura (sem React) do Server Hub, oferecendo:
- ✅ Mais leve e rápido
- ✅ Não requer build ou npm install
- ✅ Funciona abrindo o arquivo diretamente
- ✅ Mais fácil de manter e customizar
- ✅ Sistema de credenciais protegidas
- ✅ Sistema de busca em tempo real

## Licença

Livre para uso pessoal e modificação.

## Autor

Criado para Alexandre Losano - Servidor Zorin
