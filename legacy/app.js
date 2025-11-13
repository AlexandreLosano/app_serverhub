// Carregar e renderizar links
let allLinks = [];
let isReorderMode = false;
let originalOrder = [];
let currentFilter = 'all';
let selectedTags = [];

// Função para substituir variáveis nos links
function replaceVariables(text, variables) {
    if (!text || typeof text !== 'string') return text;

    let result = text;
    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }
    return result;
}

async function loadLinks() {
    try {
        const response = await fetch('links.json');
        const data = await response.json();
        const variables = data.variables || {};

        // Substituir variáveis nos endereços
        allLinks = data.links.map(link => ({
            ...link,
            endereco: replaceVariables(link.endereco, variables)
        }));

        // Aplicar ordem salva do localStorage
        const savedOrder = localStorage.getItem('linksOrder');
        if (savedOrder) {
            const orderMap = JSON.parse(savedOrder);
            allLinks.sort((a, b) => {
                const indexA = orderMap[a.nome] ?? 999;
                const indexB = orderMap[b.nome] ?? 999;
                return indexA - indexB;
            });
        }

        // Popular select de tags com as tags extraídas
        populateTagsSelect();

        renderLinks(allLinks);
    } catch (error) {
        console.error('Erro ao carregar links:', error);
        document.getElementById('linksContainer').innerHTML =
            '<div class="no-results">Erro ao carregar os serviços. Verifique se o arquivo links.json existe.</div>';
    }
}

function renderLinks(links) {
    const container = document.getElementById('linksContainer');

    if (links.length === 0) {
        container.innerHTML = '<div class="no-results">Nenhum serviço encontrado</div>';
        return;
    }

    container.innerHTML = links.map(link => createCard(link)).join('');
}

function createCard(link) {
    const cardId = `card-${Math.random().toString(36).substring(2, 11)}`;

    // Renderizar tags se existirem
    const tagsHtml = link.tags && link.tags.length > 0 ? `
        <div class="card-tags">
            ${link.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
        </div>
    ` : '';

    return `
        <div class="card" draggable="${isReorderMode}" data-link-name="${link.nome}" data-category="${link.categoria || ''}">
            <div class="card-top">
                <a href="${link.endereco}" class="card-link" target="_blank" rel="noopener noreferrer">
                    <div class="card-header">
                        <div class="card-icon" style="background-color: ${link.cor || '#667eea'}">
                            ${link.icone || '🔗'}
                        </div>
                        <div class="card-title">${link.nome}</div>
                    </div>
                </a>
                ${link.categoria ? `<span class="card-category" data-category="${link.categoria}">${link.categoria}</span>` : ''}
            </div>
            <a href="${link.endereco}" class="card-content-link" target="_blank" rel="noopener noreferrer">
                <div class="card-url">${link.endereco}</div>
                <div class="card-description">${link.observacoes}</div>
            </a>
            ${tagsHtml}
            ${link.credenciais ? `
                <div class="card-credentials">
                    <div class="credentials-header">
                        <span class="credentials-label">Credenciais:</span>
                        <button class="toggle-credentials" onclick="toggleCredentials('${cardId}')" type="button">
                            <span class="eye-icon" id="eye-${cardId}">👁️</span>
                        </button>
                    </div>
                    <div class="credentials-content hidden" id="cred-${cardId}">
                        ${link.credenciais.split('|').map(line => line.trim()).join('<br>')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Extrair todas as tags únicas dos links
function extractAllTags() {
    const allTags = new Set();
    allLinks.forEach(link => {
        if (link.tags && Array.isArray(link.tags)) {
            link.tags.forEach(tag => allTags.add(tag));
        }
    });
    return Array.from(allTags).sort();
}

// Popular o select de tags dinamicamente
function populateTagsSelect() {
    const tagsSelect = document.getElementById('tagsSelect');
    const uniqueTags = extractAllTags();

    // Limpar opções existentes (exceto "Todas")
    tagsSelect.innerHTML = '<option value="all">Todas</option>';

    // Adicionar cada tag como opção
    uniqueTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagsSelect.appendChild(option);
    });
}

// Funcionalidade de busca e filtro
function setupSearch() {
    const searchInput = document.getElementById('searchInput');

    searchInput.addEventListener('input', () => {
        applyFilters();
    });
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    let filteredLinks = allLinks;

    // Filtrar por categoria
    if (currentFilter !== 'all') {
        filteredLinks = filteredLinks.filter(link => link.categoria === currentFilter);
    }

    // Filtrar por tags selecionadas (múltiplas - OR)
    if (selectedTags.length > 0 && !selectedTags.includes('all')) {
        filteredLinks = filteredLinks.filter(link => {
            // Link deve ter pelo menos uma das tags selecionadas
            if (!link.tags || !Array.isArray(link.tags)) return false;
            return selectedTags.some(selectedTag => link.tags.includes(selectedTag));
        });
    }

    // Filtrar por termo de busca
    if (searchTerm) {
        filteredLinks = filteredLinks.filter(link => {
            return link.nome.toLowerCase().includes(searchTerm);
        });
    }

    renderLinks(filteredLinks);
}

// Configurar selects de filtro
function setupSelects() {
    const categorySelect = document.getElementById('categorySelect');
    const tagsSelect = document.getElementById('tagsSelect');

    // Event listener para select de categoria
    categorySelect.addEventListener('change', () => {
        currentFilter = categorySelect.value;
        applyFilters();
    });

    // Event listener para select de tags (múltipla seleção)
    tagsSelect.addEventListener('change', () => {
        const selectedOptions = Array.from(tagsSelect.selectedOptions);
        selectedTags = selectedOptions.map(option => option.value);

        // Se "Todas" foi selecionada, limpar outras seleções
        if (selectedTags.includes('all')) {
            // Desmarcar todas as opções
            Array.from(tagsSelect.options).forEach(option => {
                option.selected = option.value === 'all';
            });
            selectedTags = ['all'];
        }

        applyFilters();
    });
}

// Função para mostrar/ocultar credenciais
function toggleCredentials(cardId) {
    const credContent = document.getElementById(`cred-${cardId}`);
    const eyeIcon = document.getElementById(`eye-${cardId}`);

    if (credContent.classList.contains('hidden')) {
        credContent.classList.remove('hidden');
        eyeIcon.textContent = '🙈';
    } else {
        credContent.classList.add('hidden');
        eyeIcon.textContent = '👁️';
    }
}

// Relógio ao vivo
function updateClock() {
    const now = new Date();

    const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const weekday = weekdays[now.getDay()];

    const date = now.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const time = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    document.getElementById('weekday').textContent = weekday;
    document.getElementById('date').textContent = date;
    document.getElementById('time').textContent = time;
}

// Drag and Drop para reordenação
let draggedElement = null;

function setupDragAndDrop() {
    const container = document.getElementById('linksContainer');

    container.addEventListener('dragstart', (e) => {
        if (!isReorderMode) return;
        draggedElement = e.target.closest('.card');
        if (draggedElement) {
            draggedElement.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    container.addEventListener('dragend', (e) => {
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
            draggedElement = null;
        }
    });

    container.addEventListener('dragover', (e) => {
        if (!isReorderMode) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const afterElement = getDragAfterElement(container, e.clientX, e.clientY);
        const draggable = document.querySelector('.dragging');

        if (draggable && afterElement !== draggable) {
            if (afterElement == null) {
                container.appendChild(draggable);
            } else {
                container.insertBefore(draggable, afterElement);
            }
        }
    });
}

function getDragAfterElement(container, x, y) {
    const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];

    // Encontra o elemento mais próximo considerando posição X e Y (para grid)
    let closest = null;
    let minDistance = Number.POSITIVE_INFINITY;

    draggableElements.forEach(child => {
        const box = child.getBoundingClientRect();
        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height / 2;

        // Calcula distância euclidiana do cursor até o centro do card
        const distance = Math.sqrt(
            Math.pow(x - centerX, 2) +
            Math.pow(y - centerY, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closest = child;
        }
    });

    // Determina se deve inserir antes ou depois baseado na posição relativa
    if (closest) {
        const box = closest.getBoundingClientRect();
        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height / 2;

        // Se está à esquerda ou acima, retorna o elemento (insere antes)
        // Se está à direita ou abaixo, retorna o próximo elemento
        if (y < centerY || (y >= box.top && y <= box.bottom && x < centerX)) {
            return closest;
        } else {
            return closest.nextElementSibling;
        }
    }

    return null;
}

// Modo de reordenação
function setupReorderMode() {
    const reorderBtn = document.getElementById('reorderBtn');
    const saveOrderBtn = document.getElementById('saveOrderBtn');
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    const reorderActions = document.getElementById('reorderActions');
    const container = document.getElementById('linksContainer');

    reorderBtn.addEventListener('click', () => {
        isReorderMode = true;
        originalOrder = [...allLinks];

        reorderBtn.classList.add('hidden');
        reorderActions.classList.remove('hidden');
        container.classList.add('reorder-mode');

        // Tornar cards arrastáveis
        const cards = container.querySelectorAll('.card');
        cards.forEach(card => {
            card.setAttribute('draggable', 'true');
            const links = card.querySelectorAll('a');
            links.forEach(link => link.style.pointerEvents = 'none');
        });
    });

    saveOrderBtn.addEventListener('click', () => {
        // Salvar nova ordem
        const cards = container.querySelectorAll('.card');
        const orderMap = {};
        cards.forEach((card, index) => {
            const linkName = card.getAttribute('data-link-name');
            orderMap[linkName] = index;
        });

        localStorage.setItem('linksOrder', JSON.stringify(orderMap));

        // Atualizar allLinks com nova ordem
        allLinks.sort((a, b) => {
            const indexA = orderMap[a.nome] ?? 999;
            const indexB = orderMap[b.nome] ?? 999;
            return indexA - indexB;
        });

        exitReorderMode();
    });

    cancelOrderBtn.addEventListener('click', () => {
        allLinks = [...originalOrder];
        renderLinks(allLinks);
        exitReorderMode();
    });
}

function exitReorderMode() {
    isReorderMode = false;

    const reorderBtn = document.getElementById('reorderBtn');
    const reorderActions = document.getElementById('reorderActions');
    const container = document.getElementById('linksContainer');

    reorderBtn.classList.remove('hidden');
    reorderActions.classList.add('hidden');
    container.classList.remove('reorder-mode');

    const cards = container.querySelectorAll('.card');
    cards.forEach(card => {
        card.setAttribute('draggable', 'false');
        const links = card.querySelectorAll('a');
        links.forEach(link => link.style.pointerEvents = '');
    });
}

// Controle de tema
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Função para aplicar tema automático baseado no horário (6h-18h = claro)
    function applyAutoTheme() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 18) {
            // Horário diurno (6h-18h) - tema claro
            body.className = '';
        } else {
            // Horário noturno (18h-6h) - tema escuro
            body.className = 'auto-theme';
        }
    }

    // Carregar preferência salva
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light-theme' || savedTheme === 'dark-theme') {
        body.className = savedTheme;
    } else {
        // Modo auto - aplicar baseado no horário
        applyAutoTheme();
    }

    themeToggle.addEventListener('click', () => {
        // Alternar entre light-theme, dark-theme e auto
        if (body.classList.contains('light-theme')) {
            body.className = 'dark-theme';
            localStorage.setItem('theme', 'dark-theme');
            themeToggle.textContent = '🌙';
        } else if (body.classList.contains('dark-theme')) {
            localStorage.removeItem('theme');
            applyAutoTheme();
            themeToggle.textContent = '🌓';
        } else {
            // Estava em auto, mudar para light
            body.className = 'light-theme';
            localStorage.setItem('theme', 'light-theme');
            themeToggle.textContent = '☀️';
        }
    });

    // Atualizar ícone inicial
    if (body.classList.contains('light-theme')) {
        themeToggle.textContent = '☀️';
    } else if (body.classList.contains('dark-theme')) {
        themeToggle.textContent = '🌙';
    } else {
        themeToggle.textContent = '🌓';
    }

    // Atualizar tema automático a cada minuto (se estiver em modo auto)
    setInterval(() => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme || savedTheme === 'auto') {
            applyAutoTheme();
        }
    }, 60000); // Verifica a cada 1 minuto
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    loadLinks();
    setupSearch();
    setupSelects();
    setupDragAndDrop();
    setupReorderMode();
    setupThemeToggle();

    // Inicializar e atualizar relógio
    updateClock();
    setInterval(updateClock, 1000);
});
