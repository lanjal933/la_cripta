// Adventures Module
let currentPage = 1;
const pageSize = 12;
let currentFilters = {};

// DOM Elements
const adventuresGrid = document.getElementById('adventuresGrid');
const officialAdventures = document.getElementById('officialAdventures');
const officialSection = document.getElementById('officialSection');
const createAdventureBtn = document.getElementById('createAdventureBtn');
const createAdventureModal = document.getElementById('createAdventureModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const adventureForm = document.getElementById('adventureForm');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const pagination = document.getElementById('pagination');

// Filter elements
const searchInput = document.getElementById('searchInput');
const adventureTypeFilter = document.getElementById('adventureTypeFilter');
const levelFilter = document.getElementById('levelFilter');
const sortBy = document.getElementById('sortBy');
const officialOnly = document.getElementById('officialOnly');
const communityOnly = document.getElementById('communityOnly');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadAdventures();
    setupEventListeners();
});

function setupEventListeners() {
    createAdventureBtn.addEventListener('click', openCreateModal);
    closeModalBtn.addEventListener('click', closeCreateModal);
    cancelBtn.addEventListener('click', closeCreateModal);
    adventureForm.addEventListener('submit', handleAdventureSubmit);
    
    // Filter listeners
    searchInput.addEventListener('input', debounce(filterAdventures, 500));
    adventureTypeFilter.addEventListener('change', filterAdventures);
    levelFilter.addEventListener('change', filterAdventures);
    sortBy.addEventListener('change', filterAdventures);
    officialOnly.addEventListener('change', filterAdventures);
    communityOnly.addEventListener('change', filterAdventures);
    
    // Close modal on outside click
    createAdventureModal.addEventListener('click', (e) => {
        if (e.target === createAdventureModal) {
            closeCreateModal();
        }
    });
}

async function loadAdventures() {
    showLoading();
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: pageSize,
            status: 'published',
            sortBy: sortBy.value,
            order: 'desc'
        });

        if (searchInput.value) params.append('search', searchInput.value);
        if (adventureTypeFilter.value) params.append('adventureType', adventureTypeFilter.value);
        if (levelFilter.value) params.append('recommendedLevel', levelFilter.value);
        if (officialOnly.checked) params.append('isOfficial', 'true');

        const response = await apiCall(`/adventures?${params}`);
        
        if (response.adventures.length === 0) {
            showEmpty();
        } else {
            renderAdventures(response.adventures);
            renderPagination(response.pagination);
        }
    } catch (error) {
        console.error('Error loading adventures:', error);
        showEmpty();
    }
}

async function loadOfficialAdventures() {
    try {
        const response = await apiCall('/adventures?isOfficial=true&limit=6&sortBy=createdAt&order=desc');
        
        if (response.adventures.length > 0) {
            officialSection.classList.remove('hidden');
            renderAdventureCards(response.adventures, officialAdventures);
        }
    } catch (error) {
        console.error('Error loading official adventures:', error);
    }
}

function renderAdventures(adventures) {
    adventuresGrid.innerHTML = '';
    renderAdventureCards(adventures, adventuresGrid);
}

function renderAdventureCards(adventures, container) {
    adventures.forEach(adventure => {
        const card = createAdventureCard(adventure);
        container.appendChild(card);
    });
}

function createAdventureCard(adventure) {
    const card = document.createElement('div');
    card.className = 'bg-dark-umbra/90 border border-neon-violet/30 rounded-lg overflow-hidden hover:shadow-violet-glow-hover transition-all duration-300 cursor-pointer';
    
    const officialBadge = adventure.isOfficial 
        ? '<span class="absolute top-2 right-2 bg-neon-violet text-white text-xs px-2 py-1 rounded">OFICIAL</span>' 
        : '';
    
    const coverImage = adventure.coverImage 
        ? `<img src="${adventure.coverImage}" alt="${adventure.title}" class="w-full h-48 object-cover" onerror="this.style.display='none'">`
        : '<div class="w-full h-48 bg-gradient-to-br from-neon-violet/20 to-purple-900/20 flex items-center justify-center"><span class="text-4xl">⚔️</span></div>';
    
    const stars = renderStars(adventure.stats.averageRating);
    
    card.innerHTML = `
        <div class="relative">
            ${coverImage}
            ${officialBadge}
        </div>
        <div class="p-4">
            <h3 class="font-title text-xl text-neon-violet mb-2">${adventure.title}</h3>
            <p class="text-gray-400 text-sm mb-3 line-clamp-2">${adventure.description}</p>
            <div class="flex flex-wrap gap-2 mb-3">
                <span class="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">${adventure.adventureType}</span>
                <span class="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">Nivel ${adventure.recommendedLevel}</span>
                <span class="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">${adventure.recommendedPlayers} jugadores</span>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-400">
                <div class="flex items-center gap-1">
                    ${stars}
                    <span>(${adventure.stats.totalRatings})</span>
                </div>
                <span>👥 ${adventure.stats.players}</span>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                <span>por ${adventure.creator.username}</span>
                <span>${formatDate(adventure.createdAt)}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `aventura-view.html?id=${adventure._id}`;
    });
    
    return card;
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '⭐';
        } else if (i === fullStars && hasHalfStar) {
            stars += '⭐';
        } else {
            stars += '☆';
        }
    }
    
    return stars;
}

function renderPagination(paginationData) {
    pagination.innerHTML = '';
    
    if (paginationData.pages <= 1) return;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed';
    prevBtn.textContent = '← Anterior';
    prevBtn.disabled = paginationData.page === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadAdventures();
        }
    });
    pagination.appendChild(prevBtn);
    
    // Page numbers
    for (let i = 1; i <= paginationData.pages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `px-4 py-2 rounded ${i === currentPage ? 'bg-neon-violet text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            loadAdventures();
        });
        pagination.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed';
    nextBtn.textContent = 'Siguiente →';
    nextBtn.disabled = paginationData.page === paginationData.pages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < paginationData.pages) {
            currentPage++;
            loadAdventures();
        }
    });
    pagination.appendChild(nextBtn);
}

function filterAdventures() {
    currentPage = 1;
    loadAdventures();
}

function openCreateModal() {
    if (!isAuthenticated()) {
        alert('Debes iniciar sesión para crear una aventura');
        window.location.href = 'login.html';
        return;
    }
    
    createAdventureModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCreateModal() {
    createAdventureModal.classList.add('hidden');
    document.body.style.overflow = '';
    adventureForm.reset();
}

async function handleAdventureSubmit(e) {
    e.preventDefault();
    
    const adventureData = {
        title: document.getElementById('adventureTitle').value,
        description: document.getElementById('adventureDescription').value,
        category: document.getElementById('adventureCategory').value,
        adventureType: document.getElementById('adventureType').value,
        recommendedLevel: parseInt(document.getElementById('adventureLevel').value),
        recommendedPlayers: parseInt(document.getElementById('adventurePlayers').value),
        coverImage: document.getElementById('adventureCoverImage').value || null,
        tags: document.getElementById('adventureTags').value.split(',').map(t => t.trim()).filter(t => t),
        rewards: document.getElementById('adventureRewards').value.split('\n').map(r => r.trim()).filter(r => r)
    };
    
    try {
        const response = await apiCall('/adventures', {
            method: 'POST',
            body: JSON.stringify(adventureData)
        });
        
        alert('¡Aventura creada exitosamente!');
        closeCreateModal();
        
        // Redirect to adventure editor
        window.location.href = `aventura-editor.html?id=${response.adventure._id}`;
    } catch (error) {
        console.error('Error creating adventure:', error);
        alert('Error al crear la aventura. Por favor, intenta de nuevo.');
    }
}

function showLoading() {
    loadingState.classList.remove('hidden');
    adventuresGrid.classList.add('hidden');
    emptyState.classList.add('hidden');
    pagination.classList.add('hidden');
}

function showEmpty() {
    loadingState.classList.add('hidden');
    adventuresGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    pagination.classList.add('hidden');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
    return `Hace ${Math.floor(days / 365)} años`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
