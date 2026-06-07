// Adventure Editor Module
let adventureId = null;
let adventureData = null;
let chapters = [];
let choices = [];

// DOM Elements
const chapterModal = document.getElementById('chapterModal');
const choiceModal = document.getElementById('choiceModal');
const chapterForm = document.getElementById('chapterForm');
const choiceForm = document.getElementById('choiceForm');
const chaptersList = document.getElementById('chaptersList');
const flowVisualization = document.getElementById('flowVisualization');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    adventureId = new URLSearchParams(window.location.search).get('id');
    
    if (!adventureId) {
        alert('No se especificó una aventura');
        window.location.href = 'aventuras.html';
        return;
    }
    
    loadAdventure();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
    document.getElementById('publishBtn').addEventListener('click', publishAdventure);
    document.getElementById('previewBtn').addEventListener('click', previewAdventure);
    document.getElementById('addChapterBtn').addEventListener('click', () => openChapterModal());
    document.getElementById('updateInfoBtn').addEventListener('click', updateAdventureInfo);
    
    // Chapter modal
    document.getElementById('closeChapterModal').addEventListener('click', closeChapterModal);
    document.getElementById('cancelChapterBtn').addEventListener('click', closeChapterModal);
    chapterForm.addEventListener('submit', handleChapterSubmit);
    
    // Choice modal
    document.getElementById('closeChoiceModal').addEventListener('click', closeChoiceModal);
    document.getElementById('cancelChoiceBtn').addEventListener('click', closeChoiceModal);
    choiceForm.addEventListener('submit', handleChoiceSubmit);
    
    // Close modals on outside click
    chapterModal.addEventListener('click', (e) => {
        if (e.target === chapterModal) closeChapterModal();
    });
    choiceModal.addEventListener('click', (e) => {
        if (e.target === choiceModal) closeChoiceModal();
    });
}

async function loadAdventure() {
    try {
        const response = await apiCall(`/adventures/${adventureId}`);
        adventureData = response.adventure;
        chapters = response.chapters || [];
        
        // Load adventure info
        document.getElementById('editTitle').value = adventureData.title;
        document.getElementById('editCategory').value = adventureData.category;
        document.getElementById('editDescription').value = adventureData.description;
        document.getElementById('editLevel').value = adventureData.recommendedLevel;
        document.getElementById('editPlayers').value = adventureData.recommendedPlayers;
        
        updateStatusDisplay();
        renderChapters();
        renderFlowVisualization();
        
        // Check if user is creator
        if (adventureData.creator._id !== getCurrentUserId()) {
            alert('No tienes permiso para editar esta aventura');
            window.location.href = 'aventuras.html';
        }
    } catch (error) {
        console.error('Error loading adventure:', error);
        alert('Error al cargar la aventura');
        window.location.href = 'aventuras.html';
    }
}

function getCurrentUserId() {
    const token = getToken();
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
    } catch (e) {
        return null;
    }
}

function updateStatusDisplay() {
    const statusEl = document.getElementById('adventureStatus');
    const statusMap = {
        'draft': '<span class="text-yellow-400">Borrador</span>',
        'published': '<span class="text-green-400">Publicado</span>',
        'archived': '<span class="text-gray-400">Archivado</span>',
        'deleted': '<span class="text-red-400">Eliminado</span>'
    };
    statusEl.innerHTML = `Estado: ${statusMap[adventureData.status] || adventureData.status}`;
}

function renderChapters() {
    chaptersList.innerHTML = '';
    
    if (chapters.length === 0) {
        chaptersList.innerHTML = '<p class="text-gray-400 text-center py-8">No hay capítulos aún. Agrega el primer capítulo para comenzar.</p>';
        return;
    }
    
    const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
    
    sortedChapters.forEach(chapter => {
        const chapterCard = createChapterCard(chapter);
        chaptersList.appendChild(chapterCard);
    });
}

function createChapterCard(chapter) {
    const card = document.createElement('div');
    card.className = 'bg-gray-800/50 border border-gray-700 rounded-lg p-4';
    
    const endingBadge = chapter.isEnding 
        ? `<span class="bg-purple-600 text-white text-xs px-2 py-1 rounded ml-2">${chapter.endingType || 'Final'}</span>` 
        : '';
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <div>
                <h3 class="font-title text-lg text-neon-violet">${chapter.title} ${endingBadge}</h3>
                <p class="text-gray-500 text-sm">Orden: ${chapter.order}</p>
            </div>
            <div class="flex gap-2">
                <button class="edit-chapter-btn bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors" data-id="${chapter._id}">
                    Editar
                </button>
                <button class="add-choice-btn bg-neon-violet hover:bg-violet-600 text-white text-xs px-3 py-1 rounded transition-colors" data-id="${chapter._id}">
                    + Opción
                </button>
                <button class="delete-chapter-btn bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors" data-id="${chapter._id}">
                    Eliminar
                </button>
            </div>
        </div>
        <p class="text-gray-400 text-sm mb-3 line-clamp-2">${chapter.narrativeText}</p>
        <div class="flex flex-wrap gap-2">
            ${chapter.images.length > 0 ? `<span class="text-gray-500 text-xs">📷 ${chapter.images.length} imágenes</span>` : ''}
            ${chapter.rewards.length > 0 ? `<span class="text-gray-500 text-xs">🎁 ${chapter.rewards.length} recompensas</span>` : ''}
            <span class="text-gray-500 text-xs">🔀 ${getChoiceCount(chapter._id)} opciones</span>
        </div>
    `;
    
    // Event listeners
    card.querySelector('.edit-chapter-btn').addEventListener('click', () => openChapterModal(chapter));
    card.querySelector('.delete-chapter-btn').addEventListener('click', () => deleteChapter(chapter._id));
    card.querySelector('.add-choice-btn').addEventListener('click', () => openChoiceModal(chapter._id));
    
    return card;
}

function getChoiceCount(chapterId) {
    return choices.filter(c => c.chapter.toString() === chapterId.toString()).length;
}

async function loadChoices() {
    try {
        const response = await apiCall(`/adventures/${adventureId}`);
        const allChapters = response.chapters || [];
        
        choices = [];
        for (const chapter of allChapters) {
            if (chapter.choices) {
                choices.push(...chapter.choices);
            }
        }
    } catch (error) {
        console.error('Error loading choices:', error);
    }
}

function renderFlowVisualization() {
    if (chapters.length === 0) {
        flowVisualization.innerHTML = '<p class="text-gray-400">Agrega capítulos para ver el flujo de la aventura</p>';
        return;
    }
    
    const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
    
    let html = '<div class="flex flex-col items-center gap-4">';
    
    sortedChapters.forEach((chapter, index) => {
        const isEnding = chapter.isEnding ? '🏁' : '📖';
        const hasChoices = getChoiceCount(chapter._id) > 0;
        
        html += `
            <div class="flex items-center gap-4">
                <div class="bg-gray-800 border border-neon-violet/30 rounded-lg p-4 min-w-[200px]">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-2xl">${isEnding}</span>
                        <span class="font-title text-neon-violet">${chapter.title}</span>
                    </div>
                    <p class="text-gray-500 text-xs">Orden: ${chapter.order}</p>
                    ${hasChoices ? '<p class="text-gray-500 text-xs mt-1">🔀 Tiene opciones</p>' : ''}
                </div>
                ${index < sortedChapters.length - 1 ? '<div class="text-neon-violet text-2xl">↓</div>' : ''}
            </div>
        `;
    });
    
    html += '</div>';
    flowVisualization.innerHTML = html;
}

function openChapterModal(chapter = null) {
    chapterForm.reset();
    document.getElementById('chapterId').value = chapter ? chapter._id : '';
    document.getElementById('chapterTitle').value = chapter ? chapter.title : '';
    document.getElementById('chapterOrder').value = chapter ? chapter.order : chapters.length;
    document.getElementById('chapterNarrative').value = chapter ? chapter.narrativeText : '';
    document.getElementById('chapterImages').value = chapter ? chapter.images.join('\n') : '';
    document.getElementById('chapterRewards').value = chapter ? chapter.rewards.join('\n') : '';
    document.getElementById('chapterConditions').value = chapter ? chapter.conditions.join('\n') : '';
    document.getElementById('isEnding').checked = chapter ? chapter.isEnding : false;
    document.getElementById('endingType').value = chapter ? chapter.endingType || '' : '';
    
    chapterModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeChapterModal() {
    chapterModal.classList.add('hidden');
    document.body.style.overflow = '';
    chapterForm.reset();
}

async function handleChapterSubmit(e) {
    e.preventDefault();
    
    const chapterId = document.getElementById('chapterId').value;
    const chapterData = {
        title: document.getElementById('chapterTitle').value,
        narrativeText: document.getElementById('chapterNarrative').value,
        order: parseInt(document.getElementById('chapterOrder').value),
        images: document.getElementById('chapterImages').value.split('\n').map(i => i.trim()).filter(i => i),
        rewards: document.getElementById('chapterRewards').value.split('\n').map(r => r.trim()).filter(r => r),
        conditions: document.getElementById('chapterConditions').value.split('\n').map(c => c.trim()).filter(c => c),
        isEnding: document.getElementById('isEnding').checked,
        endingType: document.getElementById('endingType').value || null
    };
    
    try {
        if (chapterId) {
            await apiCall(`/adventures/chapters/${chapterId}`, {
                method: 'PUT',
                body: JSON.stringify(chapterData)
            });
        } else {
            await apiCall(`/adventures/${adventureId}/chapters`, {
                method: 'POST',
                body: JSON.stringify(chapterData)
            });
        }
        
        closeChapterModal();
        loadAdventure();
        loadChoices();
    } catch (error) {
        console.error('Error saving chapter:', error);
        alert('Error al guardar el capítulo');
    }
}

async function deleteChapter(chapterId) {
    if (!confirm('¿Estás seguro de eliminar este capítulo?')) return;
    
    try {
        await apiCall(`/adventures/chapters/${chapterId}`, {
            method: 'DELETE'
        });
        
        loadAdventure();
        loadChoices();
    } catch (error) {
        console.error('Error deleting chapter:', error);
        alert('Error al eliminar el capítulo');
    }
}

function openChoiceModal(chapterId) {
    choiceForm.reset();
    document.getElementById('choiceId').value = '';
    document.getElementById('choiceChapterId').value = chapterId;
    document.getElementById('choiceText').value = '';
    document.getElementById('choiceOrder').value = getChoiceCount(chapterId);
    document.getElementById('choiceConditions').value = '';
    document.getElementById('choiceOutcomes').value = '';
    
    // Populate target chapter dropdown
    const targetSelect = document.getElementById('choiceTargetChapter');
    targetSelect.innerHTML = '<option value="">Seleccionar capítulo destino</option>';
    
    const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
    sortedChapters.forEach(chapter => {
        if (chapter._id.toString() !== chapterId.toString()) {
            const option = document.createElement('option');
            option.value = chapter._id;
            option.textContent = `${chapter.order}. ${chapter.title}`;
            targetSelect.appendChild(option);
        }
    });
    
    choiceModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeChoiceModal() {
    choiceModal.classList.add('hidden');
    document.body.style.overflow = '';
    choiceForm.reset();
}

async function handleChoiceSubmit(e) {
    e.preventDefault();
    
    const choiceData = {
        text: document.getElementById('choiceText').value,
        targetChapter: document.getElementById('choiceTargetChapter').value || null,
        conditions: document.getElementById('choiceConditions').value.split('\n').map(c => c.trim()).filter(c => c),
        outcomes: document.getElementById('choiceOutcomes').value.split('\n').map(o => o.trim()).filter(o => o),
        order: parseInt(document.getElementById('choiceOrder').value)
    };
    
    const chapterId = document.getElementById('choiceChapterId').value;
    
    try {
        await apiCall(`/adventures/chapters/${chapterId}/choices`, {
            method: 'POST',
            body: JSON.stringify(choiceData)
        });
        
        closeChoiceModal();
        loadChoices();
        renderChapters();
    } catch (error) {
        console.error('Error saving choice:', error);
        alert('Error al guardar la opción');
    }
}

async function updateAdventureInfo() {
    const updateData = {
        title: document.getElementById('editTitle').value,
        category: document.getElementById('editCategory').value,
        description: document.getElementById('editDescription').value,
        recommendedLevel: parseInt(document.getElementById('editLevel').value),
        recommendedPlayers: parseInt(document.getElementById('editPlayers').value)
    };
    
    try {
        await apiCall(`/adventures/${adventureId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        alert('Información actualizada');
        loadAdventure();
    } catch (error) {
        console.error('Error updating adventure:', error);
        alert('Error al actualizar la aventura');
    }
}

async function saveDraft() {
    try {
        await apiCall(`/adventures/${adventureId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'draft' })
        });
        
        alert('Borrador guardado');
        loadAdventure();
    } catch (error) {
        console.error('Error saving draft:', error);
        alert('Error al guardar el borrador');
    }
}

async function publishAdventure() {
    if (chapters.length === 0) {
        alert('Debes agregar al menos un capítulo antes de publicar');
        return;
    }
    
    if (!confirm('¿Estás seguro de publicar esta aventura? Una vez publicada, estará visible para todos los usuarios.')) {
        return;
    }
    
    try {
        await apiCall(`/adventures/${adventureId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'published' })
        });
        
        alert('¡Aventura publicada exitosamente!');
        loadAdventure();
    } catch (error) {
        console.error('Error publishing adventure:', error);
        alert('Error al publicar la aventura');
    }
}

function previewAdventure() {
    window.open(`aventura-view.html?id=${adventureId}&preview=true`, '_blank');
}
