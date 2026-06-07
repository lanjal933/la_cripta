// Adventure View Module
let adventureId = null;
let adventureData = null;
let chapters = [];
let currentProgress = null;
let isPreview = false;

// DOM Elements
const loadingState = document.getElementById('loadingState');
const adventureContent = document.getElementById('adventureContent');
const chapterContent = document.getElementById('chapterContent');
const endingScreen = document.getElementById('endingScreen');
const ratingModal = document.getElementById('ratingModal');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    adventureId = urlParams.get('id');
    isPreview = urlParams.get('preview') === 'true';
    
    if (!adventureId) {
        alert('No se especificó una aventura');
        window.location.href = 'aventuras.html';
        return;
    }
    
    loadAdventure();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('startAdventureBtn').addEventListener('click', startAdventure);
    document.getElementById('rateAdventureBtn').addEventListener('click', () => openRatingModal());
    document.getElementById('rateAfterEndingBtn').addEventListener('click', () => openRatingModal());
    document.getElementById('restartBtn').addEventListener('click', restartAdventure);
    
    // Rating modal
    document.getElementById('closeRatingModal').addEventListener('click', closeRatingModal);
    document.getElementById('cancelRatingBtn').addEventListener('click', closeRatingModal);
    document.getElementById('ratingForm').addEventListener('submit', handleRatingSubmit);
    
    // Star rating
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            document.getElementById('ratingValue').value = rating;
            updateStarDisplay(rating);
        });
    });
    
    // Close modal on outside click
    ratingModal.addEventListener('click', (e) => {
        if (e.target === ratingModal) closeRatingModal();
    });
}

async function loadAdventure() {
    try {
        const response = await apiCall(`/adventures/${adventureId}`);
        adventureData = response.adventure;
        chapters = response.chapters || [];
        
        renderAdventureHeader();
        loadRatings();
        
        if (!isPreview && isAuthenticated()) {
            loadProgress();
        }
        
        adventureContent.classList.remove('hidden');
        loadingState.classList.add('hidden');
    } catch (error) {
        console.error('Error loading adventure:', error);
        alert('Error al cargar la aventura');
        window.location.href = 'aventuras.html';
    }
}

function renderAdventureHeader() {
    document.getElementById('adventureTitle').textContent = adventureData.title;
    document.getElementById('adventureDescription').textContent = adventureData.description;
    document.getElementById('adventureType').textContent = getAdventureTypeLabel(adventureData.adventureType);
    document.getElementById('adventureLevel').textContent = `Nivel ${adventureData.recommendedLevel}`;
    document.getElementById('adventurePlayers').textContent = `${adventureData.recommendedPlayers} jugadores`;
    document.getElementById('adventureCategory').textContent = adventureData.category;
    
    // Creator info
    document.getElementById('creatorName').textContent = adventureData.creator.username;
    document.getElementById('creationDate').textContent = formatDate(adventureData.createdAt);
    document.getElementById('playerCount').textContent = `👥 ${adventureData.stats.players} jugadores`;
    document.getElementById('completionCount').textContent = `✅ ${adventureData.stats.completions} completados`;
    
    // Official badge
    if (adventureData.isOfficial) {
        document.getElementById('officialBadge').classList.remove('hidden');
    }
    
    // Rating
    renderStars(adventureData.stats.averageRating);
    document.getElementById('ratingCount').textContent = `(${adventureData.stats.totalRatings} valoraciones)`;
    
    // Tags
    const tagsContainer = document.getElementById('tagsContainer');
    tagsContainer.innerHTML = '';
    adventureData.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded';
        tagEl.textContent = tag;
        tagsContainer.appendChild(tagEl);
    });
    
    // Rewards
    if (adventureData.rewards.length > 0) {
        document.getElementById('rewardsContainer').classList.remove('hidden');
        const rewardsList = document.getElementById('rewardsList');
        rewardsList.innerHTML = '';
        adventureData.rewards.forEach(reward => {
            const rewardEl = document.createElement('span');
            rewardEl.className = 'bg-yellow-900/30 text-yellow-400 text-sm px-3 py-1 rounded';
            rewardEl.textContent = `🎁 ${reward}`;
            rewardsList.appendChild(rewardEl);
        });
    }
    
    // Hide start button in preview mode
    if (isPreview) {
        document.getElementById('actionButtons').classList.add('hidden');
    }
}

function getAdventureTypeLabel(type) {
    const labels = {
        'solo': 'Solo Aventura',
        'cooperative': 'Cooperativa',
        'narrative': 'Narrativa'
    };
    return labels[type] || type;
}

function renderStars(rating) {
    const starsContainer = document.getElementById('ratingStars');
    starsContainer.innerHTML = '';
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        star.className = 'text-yellow-400';
        if (i < fullStars) {
            star.textContent = '⭐';
        } else if (i === fullStars && hasHalfStar) {
            star.textContent = '⭐';
        } else {
            star.textContent = '☆';
            star.className = 'text-gray-600';
        }
        starsContainer.appendChild(star);
    }
}

async function loadProgress() {
    try {
        const response = await apiCall(`/adventures/${adventureId}/progress`);
        currentProgress = response.progress;
        
        if (currentProgress && currentProgress.status === 'in_progress') {
            document.getElementById('startAdventureBtn').textContent = 'Continuar Aventura';
            loadChapter(currentProgress.currentChapter);
        } else if (currentProgress && currentProgress.status === 'completed') {
            document.getElementById('startAdventureBtn').textContent = 'Jugar de nuevo';
        }
    } catch (error) {
        // Progress doesn't exist yet
        console.log('No progress found');
    }
}

async function startAdventure() {
    if (!isAuthenticated()) {
        alert('Debes iniciar sesión para jugar aventuras');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await apiCall(`/adventures/${adventureId}/start`, {
            method: 'POST'
        });
        
        currentProgress = response.progress;
        document.getElementById('actionButtons').classList.add('hidden');
        
        // Load first chapter
        if (currentProgress.currentChapter) {
            loadChapter(currentProgress.currentChapter);
        } else {
            alert('Esta aventura no tiene capítulos');
        }
    } catch (error) {
        console.error('Error starting adventure:', error);
        alert('Error al comenzar la aventura');
    }
}

function loadChapter(chapterId) {
    const chapter = chapters.find(c => c._id.toString() === chapterId.toString());
    
    if (!chapter) {
        alert('Capítulo no encontrado');
        return;
    }
    
    document.getElementById('chapterTitle').textContent = chapter.title;
    document.getElementById('chapterNarrative').textContent = chapter.narrativeText;
    
    // Images
    const imagesContainer = document.getElementById('chapterImages');
    imagesContainer.innerHTML = '';
    if (chapter.images && chapter.images.length > 0) {
        chapter.images.forEach(imageUrl => {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = chapter.title;
            img.className = 'w-full rounded-lg mb-4';
            img.onerror = () => img.style.display = 'none';
            imagesContainer.appendChild(img);
        });
    }
    
    // Rewards
    if (chapter.rewards && chapter.rewards.length > 0) {
        document.getElementById('chapterRewards').classList.remove('hidden');
        const rewardsList = document.getElementById('chapterRewardsList');
        rewardsList.innerHTML = '';
        chapter.rewards.forEach(reward => {
            const rewardEl = document.createElement('span');
            rewardEl.className = 'bg-yellow-900/30 text-yellow-400 text-sm px-3 py-1 rounded';
            rewardEl.textContent = `🎁 ${reward}`;
            rewardsList.appendChild(rewardEl);
        });
    } else {
        document.getElementById('chapterRewards').classList.add('hidden');
    }
    
    // Choices
    const choicesContainer = document.getElementById('choicesContainer');
    choicesContainer.innerHTML = '';
    
    if (chapter.choices && chapter.choices.length > 0) {
        chapter.choices.forEach(choice => {
            const choiceBtn = document.createElement('button');
            choiceBtn.className = 'w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-neon-violet text-white text-left p-4 rounded-lg transition-all duration-300';
            choiceBtn.textContent = choice.text;
            choiceBtn.addEventListener('click', () => makeChoice(choice._id));
            choicesContainer.appendChild(choiceBtn);
        });
    } else if (chapter.isEnding) {
        showEnding(chapter);
    } else {
        // No choices and not an ending - show continue button
        const continueBtn = document.createElement('button');
        continueBtn.className = 'w-full bg-neon-violet hover:bg-violet-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300';
        continueBtn.textContent = 'Continuar';
        continueBtn.addEventListener('click', () => goToNextChapter(chapter));
        choicesContainer.appendChild(continueBtn);
    }
    
    chapterContent.classList.remove('hidden');
    updateProgress();
}

async function makeChoice(choiceId) {
    try {
        const response = await apiCall(`/adventures/${adventureId}/progress/choice`, {
            method: 'POST',
            body: JSON.stringify({ choiceId })
        });
        
        currentProgress = response.progress;
        
        if (currentProgress.status === 'completed') {
            const currentChapter = chapters.find(c => c._id.toString() === currentProgress.currentChapter.toString());
            showEnding(currentChapter);
        } else {
            loadChapter(currentProgress.currentChapter);
        }
    } catch (error) {
        console.error('Error making choice:', error);
        alert('Error al procesar tu elección');
    }
}

async function goToNextChapter(currentChapter) {
    const currentIndex = chapters.findIndex(c => c._id.toString() === currentChapter._id.toString());
    const nextChapter = chapters[currentIndex + 1];
    
    if (nextChapter) {
        // Simulate choice to move to next chapter
        try {
            await apiCall(`/adventures/${adventureId}/progress/choice`, {
                method: 'POST',
                body: JSON.stringify({ choiceId: null })
            });
            loadChapter(nextChapter._id);
        } catch (error) {
            console.error('Error advancing chapter:', error);
        }
    } else {
        showEnding(currentChapter);
    }
}

function showEnding(chapter) {
    chapterContent.classList.add('hidden');
    endingScreen.classList.remove('hidden');
    
    document.getElementById('endingTitle').textContent = chapter.title;
    
    const endingTypeLabels = {
        'good': 'Buen Final',
        'bad': 'Mal Final',
        'neutral': 'Final Neutral',
        'secret': 'Final Secreto'
    };
    
    document.getElementById('endingType').textContent = endingTypeLabels[chapter.endingType] || 'Final';
}

function updateProgress() {
    if (!currentProgress) return;
    
    const totalChapters = chapters.length;
    const completedChapters = currentProgress.completedChapters.length;
    const percentage = Math.round((completedChapters / totalChapters) * 100);
    
    document.getElementById('progressText').textContent = `${completedChapters}/${totalChapters} capítulos`;
    document.getElementById('progressBar').style.width = `${percentage}%`;
}

async function restartAdventure() {
    if (!confirm('¿Estás seguro de reiniciar la aventura? Perderás todo tu progreso actual.')) {
        return;
    }
    
    try {
        await apiCall(`/adventures/${adventureId}/start`, {
            method: 'POST'
        });
        
        endingScreen.classList.add('hidden');
        startAdventure();
    } catch (error) {
        console.error('Error restarting adventure:', error);
        alert('Error al reiniciar la aventura');
    }
}

function openRatingModal() {
    if (!isAuthenticated()) {
        alert('Debes iniciar sesión para valorar aventuras');
        window.location.href = 'login.html';
        return;
    }
    
    ratingModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeRatingModal() {
    ratingModal.classList.add('hidden');
    document.body.style.overflow = '';
    document.getElementById('ratingForm').reset();
    document.getElementById('ratingValue').value = 0;
    updateStarDisplay(0);
}

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '⭐';
            star.classList.add('text-yellow-400');
        } else {
            star.textContent = '☆';
            star.classList.remove('text-yellow-400');
        }
    });
}

async function handleRatingSubmit(e) {
    e.preventDefault();
    
    const rating = parseInt(document.getElementById('ratingValue').value);
    const review = document.getElementById('ratingReview').value;
    
    if (rating === 0) {
        alert('Por favor, selecciona una valoración');
        return;
    }
    
    try {
        await apiCall(`/adventures/${adventureId}/rate`, {
            method: 'POST',
            body: JSON.stringify({ rating, review })
        });
        
        alert('¡Valoración enviada!');
        closeRatingModal();
        loadAdventure(); // Reload to show updated rating
    } catch (error) {
        console.error('Error submitting rating:', error);
        alert('Error al enviar la valoración');
    }
}

async function loadRatings() {
    try {
        const response = await apiCall(`/adventures/${adventureId}/ratings`);
        const ratings = response.ratings;
        
        const ratingsList = document.getElementById('ratingsList');
        ratingsList.innerHTML = '';
        
        if (ratings.length === 0) {
            ratingsList.innerHTML = '<p class="text-gray-400 text-center py-4">Aún no hay valoraciones</p>';
            return;
        }
        
        ratings.forEach(rating => {
            const ratingCard = document.createElement('div');
            ratingCard.className = 'bg-gray-800/50 border border-gray-700 rounded-lg p-4';
            
            const stars = '⭐'.repeat(rating.rating) + '☆'.repeat(5 - rating.rating);
            
            ratingCard.innerHTML = `
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        ${rating.user.avatar ? `<img src="${rating.user.avatar}" class="w-8 h-8 rounded-full">` : rating.user.username.charAt(0).toUpperCase()}
                    </div>
                    <span class="font-bold">${rating.user.username}</span>
                    <span class="text-yellow-400">${stars}</span>
                </div>
                ${rating.review ? `<p class="text-gray-400 text-sm">${rating.review}</p>` : ''}
                <p class="text-gray-500 text-xs mt-2">${formatDate(rating.createdAt)}</p>
            `;
            
            ratingsList.appendChild(ratingCard);
        });
    } catch (error) {
        console.error('Error loading ratings:', error);
    }
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
