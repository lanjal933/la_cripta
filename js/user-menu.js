// User Menu System
const USER_KEY = 'cripta_user';
const API_BASE = '/api';

// DOM elements
let userMenuBtn = null;
let userMenuDropdown = null;
let profileModal = null;
let editDiscordModal = null;
let editCountryModal = null;
let matchmakingRequestsModal = null;
let notificationsModal = null;
let settingsModal = null;

let currentUser = null;

// Initialize user menu
async function initUserMenu() {
    // Check if user is logged in
    const token = localStorage.getItem('cripta_token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            currentUser = result.user;
            localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
            
            // Add user menu to navigation
            addUserMenuToNav();
            
            // Create modals
            createModals();
            
            // Add event listeners
            addEventListeners();
        } else {
            // Token invalid, remove it
            localStorage.removeItem('cripta_token');
            localStorage.removeItem(USER_KEY);
        }
    } catch (error) {
        console.error('Error loading user:', error);
    }
}

// Add user menu to navigation
function addUserMenuToNav() {
    const nav = document.querySelector('nav .flex.flex-wrap');
    if (!nav) return;
    
    // Create user menu container
    const userMenuContainer = document.createElement('div');
    userMenuContainer.className = 'relative';
    userMenuContainer.innerHTML = `
        <button id="userMenuBtn" class="flex items-center gap-2 bg-neon-violet/20 hover:bg-neon-violet/30 px-4 py-2 rounded-lg transition-colors">
            <div class="w-8 h-8 bg-neon-violet rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-sm">${currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}</span>
            </div>
            <span class="text-white text-sm hidden md:inline">${currentUser.username || 'Usuario'}</span>
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </button>
        <div id="userMenuDropdown" class="hidden absolute right-0 mt-2 w-64 bg-dark-umbra border border-neon-violet/30 rounded-lg shadow-violet-glow z-50">
            <div class="p-2">
                <button class="menu-item w-full text-left px-4 py-3 rounded-lg hover:bg-neon-violet/20 text-white flex items-center gap-3">
                    <span class="text-xl">👤</span>
                    <span>Perfil</span>
                </button>
                <button class="menu-item w-full text-left px-4 py-3 rounded-lg hover:bg-neon-violet/20 text-white flex items-center gap-3" data-action="edit-discord">
                    <span class="text-xl">💬</span>
                    <span>Editar Usuario de Discord</span>
                </button>
                <button class="menu-item w-full text-left px-4 py-3 rounded-lg hover:bg-neon-violet/20 text-white flex items-center gap-3" data-action="edit-country">
                    <span class="text-xl">🌍</span>
                    <span>Editar País y Zona Horaria</span>
                </button>
                <button class="menu-item w-full text-left px-4 py-3 rounded-lg hover:bg-neon-violet/20 text-white flex items-center gap-3" data-action="matchmaking-requests">
                    <span class="text-xl">🎮</span>
                    <span>Mis Solicitudes de Matchmaking</span>
                </button>
                <button class="menu-item w-full text-left px-4 py-3 rounded-lg hover:bg-neon-violet/20 text-white flex items-center gap-3" data-action="notifications">
                    <span class="text-xl">🔔</span>
                    <span>Notificaciones</span>
                </button>
                <button class="menu-item w-full text-left px-4 py-3 rounded-lg hover:bg-neon-violet/20 text-white flex items-center gap-3" data-action="settings">
                    <span class="text-xl">⚙️</span>
                    <span>Configuración</span>
                </button>
                <hr class="border-neon-violet/30 my-2">
                <button class="menu-item w-full text-left px-4 py-3 rounded-lg hover:bg-red-600/20 text-red-400 flex items-center gap-3" data-action="logout">
                    <span class="text-xl">🚪</span>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    `;
    
    nav.appendChild(userMenuContainer);
    
    // Get DOM elements
    userMenuBtn = document.getElementById('userMenuBtn');
    userMenuDropdown = document.getElementById('userMenuDropdown');
}

// Create modals
function createModals() {
    // Profile Modal
    const profileModalHTML = `
        <div id="profileModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center px-4">
            <div class="bg-dark-umbra border-2 border-neon-violet/30 rounded-lg p-8 max-w-md w-full shadow-violet-glow">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="font-title text-2xl text-neon-violet">👤 Perfil</h2>
                    <button class="close-modal text-gray-400 hover:text-white text-2xl">✕</button>
                </div>
                <div class="space-y-4">
                    <div class="text-center mb-6">
                        <div class="w-20 h-20 bg-neon-violet rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-white font-bold text-3xl">${currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}</span>
                        </div>
                        <h3 class="text-white font-bold text-xl">${currentUser.username || 'Usuario'}</h3>
                        <p class="text-gray-400">${currentUser.email || ''}</p>
                    </div>
                    <div class="bg-dark-umbra/50 rounded-lg p-4 space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Usuario Discord:</span>
                            <span class="text-white">${currentUser.username || '-'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">ID Discord:</span>
                            <span class="text-white">${currentUser.discordNumericId || '-'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">País:</span>
                            <span class="text-white">${currentUser.country || '-'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Zona Horaria:</span>
                            <span class="text-white">${currentUser.timezone || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', profileModalHTML);
    
    // Edit Discord Modal
    const editDiscordModalHTML = `
        <div id="editDiscordModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center px-4">
            <div class="bg-dark-umbra border-2 border-neon-violet/30 rounded-lg p-8 max-w-md w-full shadow-violet-glow">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="font-title text-2xl text-neon-violet">💬 Editar Usuario de Discord</h2>
                    <button class="close-modal text-gray-400 hover:text-white text-2xl">✕</button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm uppercase tracking-wider text-gray-400 mb-2">Usuario de Discord</label>
                        <input type="text" id="editDiscordUsername" value="${currentUser.username || ''}" 
                            class="w-full bg-dark-umbra border-2 border-neon-violet/30 rounded-lg px-4 py-3 text-platinum-white focus:border-neon-violet focus:outline-none transition-colors">
                    </div>
                    <div>
                        <label class="block text-sm uppercase tracking-wider text-gray-400 mb-2">ID de Discord (Opcional)</label>
                        <input type="text" id="editDiscordId" value="${currentUser.discordNumericId || ''}" 
                            class="w-full bg-dark-umbra border-2 border-neon-violet/30 rounded-lg px-4 py-3 text-platinum-white focus:border-neon-violet focus:outline-none transition-colors">
                    </div>
                    <button id="saveDiscordBtn" class="w-full bg-neon-violet hover:bg-violet-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', editDiscordModalHTML);
    
    // Edit Country Modal
    const editCountryModalHTML = `
        <div id="editCountryModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center px-4">
            <div class="bg-dark-umbra border-2 border-neon-violet/30 rounded-lg p-8 max-w-md w-full shadow-violet-glow">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="font-title text-2xl text-neon-violet">🌍 Editar País y Zona Horaria</h2>
                    <button class="close-modal text-gray-400 hover:text-white text-2xl">✕</button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm uppercase tracking-wider text-gray-400 mb-2">País</label>
                        <select id="editCountry" class="w-full bg-dark-umbra border-2 border-neon-violet/30 rounded-lg px-4 py-3 text-platinum-white focus:border-neon-violet focus:outline-none transition-colors">
                            <option value="">Selecciona tu país...</option>
                            <option value="🇦🇷">🇦🇷 Argentina</option>
                            <option value="🇲🇽">🇲🇽 México</option>
                            <option value="🇪🇸">🇪🇸 España</option>
                            <option value="🇨🇴">🇨🇴 Colombia</option>
                            <option value="🇨🇱">🇨🇱 Chile</option>
                            <option value="🇵🇪">🇵🇪 Perú</option>
                            <option value="🇻🇪">🇻🇪 Venezuela</option>
                            <option value="🇪🇨">🇪🇨 Ecuador</option>
                            <option value="🇬🇹">🇬🇹 Guatemala</option>
                            <option value="🇨🇺">🇨🇺 Cuba</option>
                            <option value="🇧🇴">🇧🇴 Bolivia</option>
                            <option value="🇵🇾">🇵🇾 Paraguay</option>
                            <option value="🇺🇾">🇺🇾 Uruguay</option>
                            <option value="🇨🇷">🇨🇷 Costa Rica</option>
                            <option value="🇵🇦">🇵🇦 Panamá</option>
                            <option value="🇩🇴">🇩🇴 República Dominicana</option>
                            <option value="🇭🇳">🇭🇳 Honduras</option>
                            <option value="🇸🇻">🇸🇻 El Salvador</option>
                            <option value="🇳🇮">🇳🇮 Nicaragua</option>
                            <option value="🇵🇷">🇵🇷 Puerto Rico</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm uppercase tracking-wider text-gray-400 mb-2">Zona Horaria</label>
                        <select id="editTimezone" class="w-full bg-dark-umbra border-2 border-neon-violet/30 rounded-lg px-4 py-3 text-platinum-white focus:border-neon-violet focus:outline-none transition-colors">
                            <option value="">Selecciona tu zona horaria...</option>
                            <option value="UTC-5">UTC-5 (México, Colombia, Perú)</option>
                            <option value="UTC-4">UTC-4 (Chile, Venezuela, Bolivia)</option>
                            <option value="UTC-3">UTC-3 (Argentina, Uruguay, Brasil)</option>
                            <option value="UTC-2">UTC-2 (Fernando de Noronha)</option>
                            <option value="UTC-1">UTC-1 (Azores)</option>
                            <option value="UTC+0">UTC+0 (Reino Unido, Portugal)</option>
                            <option value="UTC+1">UTC+1 (España, Francia, Alemania)</option>
                            <option value="UTC+2">UTC+2 (Grecia, Finlandia)</option>
                        </select>
                    </div>
                    <button id="saveCountryBtn" class="w-full bg-neon-violet hover:bg-violet-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', editCountryModalHTML);
    
    // Matchmaking Requests Modal
    const matchmakingRequestsModalHTML = `
        <div id="matchmakingRequestsModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center px-4">
            <div class="bg-dark-umbra border-2 border-neon-violet/30 rounded-lg p-8 max-w-2xl w-full shadow-violet-glow">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="font-title text-2xl text-neon-violet">🎮 Mis Solicitudes de Matchmaking</h2>
                    <button class="close-modal text-gray-400 hover:text-white text-2xl">✕</button>
                </div>
                <div id="matchmakingRequestsList" class="space-y-4">
                    <p class="text-gray-400 text-center">No tienes solicitudes activas</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', matchmakingRequestsModalHTML);
    
    // Notifications Modal
    const notificationsModalHTML = `
        <div id="notificationsModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center px-4">
            <div class="bg-dark-umbra border-2 border-neon-violet/30 rounded-lg p-8 max-w-md w-full shadow-violet-glow">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="font-title text-2xl text-neon-violet">🔔 Notificaciones</h2>
                    <button class="close-modal text-gray-400 hover:text-white text-2xl">✕</button>
                </div>
                <div id="notificationsList" class="space-y-4">
                    <p class="text-gray-400 text-center">No tienes notificaciones</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', notificationsModalHTML);
    
    // Settings Modal
    const settingsModalHTML = `
        <div id="settingsModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center px-4">
            <div class="bg-dark-umbra border-2 border-neon-violet/30 rounded-lg p-8 max-w-md w-full shadow-violet-glow">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="font-title text-2xl text-neon-violet">⚙️ Configuración</h2>
                    <button class="close-modal text-gray-400 hover:text-white text-2xl">✕</button>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <span class="text-white">Notificaciones de Matchmaking</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="matchmakingNotifications" class="sr-only peer" checked>
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neon-violet rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-violet"></div>
                        </label>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-white">Sonidos de Notificación</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="soundNotifications" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neon-violet rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-violet"></div>
                        </label>
                    </div>
                    <button id="saveSettingsBtn" class="w-full bg-neon-violet hover:bg-violet-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 mt-4">
                        Guardar Configuración
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', settingsModalHTML);
    
    // Get modal elements
    profileModal = document.getElementById('profileModal');
    editDiscordModal = document.getElementById('editDiscordModal');
    editCountryModal = document.getElementById('editCountryModal');
    matchmakingRequestsModal = document.getElementById('matchmakingRequestsModal');
    notificationsModal = document.getElementById('notificationsModal');
    settingsModal = document.getElementById('settingsModal');
    
    // Set current values
    if (currentUser.country) {
        document.getElementById('editCountry').value = currentUser.country;
    }
    if (currentUser.timezone) {
        document.getElementById('editTimezone').value = currentUser.timezone;
    }
}

// Add event listeners
function addEventListeners() {
    // Toggle dropdown
    userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenuDropdown.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        userMenuDropdown.classList.add('hidden');
    });
    
    // Menu item clicks
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            
            switch(action) {
                case 'edit-discord':
                    openModal(editDiscordModal);
                    break;
                case 'edit-country':
                    openModal(editCountryModal);
                    break;
                case 'matchmaking-requests':
                    openModal(matchmakingRequestsModal);
                    loadMatchmakingRequests();
                    break;
                case 'notifications':
                    openModal(notificationsModal);
                    loadNotifications();
                    break;
                case 'settings':
                    openModal(settingsModal);
                    break;
                case 'logout':
                    logout();
                    break;
                default:
                    // Profile
                    openModal(profileModal);
            }
        });
    });
    
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    // Save Discord changes
    document.getElementById('saveDiscordBtn').addEventListener('click', async () => {
        const username = document.getElementById('editDiscordUsername').value.trim();
        const numericId = document.getElementById('editDiscordId').value.trim();
        
        if (!username) {
            alert('El usuario de Discord es obligatorio');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('cripta_token')}`
                },
                body: JSON.stringify({
                    discordUsername: username,
                    discordNumericId: numericId || null
                })
            });

            if (response.ok) {
                const result = await response.json();
                currentUser = result.user;
                localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
                closeAllModals();
                alert('Cambios guardados exitosamente');
                location.reload();
            } else {
                const result = await response.json();
                alert(result.error || 'Error guardando cambios');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    });
    
    // Save Country changes
    document.getElementById('saveCountryBtn').addEventListener('click', async () => {
        const country = document.getElementById('editCountry').value;
        const timezone = document.getElementById('editTimezone').value;
        
        if (!country || !timezone) {
            alert('País y zona horaria son obligatorios');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('cripta_token')}`
                },
                body: JSON.stringify({ country, timezone })
            });

            if (response.ok) {
                const result = await response.json();
                currentUser = result.user;
                localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
                closeAllModals();
                alert('Cambios guardados exitosamente');
                location.reload();
            } else {
                const result = await response.json();
                alert(result.error || 'Error guardando cambios');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    });
    
    // Save Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
        const matchmakingNotif = document.getElementById('matchmakingNotifications').checked;
        const soundNotif = document.getElementById('soundNotifications').checked;
        
        try {
            const response = await fetch(`${API_BASE}/auth/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('cripta_token')}`
                },
                body: JSON.stringify({
                    settings: {
                        matchmakingNotifications: matchmakingNotif,
                        soundNotifications: soundNotif
                    }
                })
            });

            if (response.ok) {
                const result = await response.json();
                currentUser = result.user;
                localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
                closeAllModals();
                alert('Configuración guardada exitosamente');
            } else {
                const result = await response.json();
                alert(result.error || 'Error guardando configuración');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    });
}

// Open modal
function openModal(modal) {
    modal.classList.remove('hidden');
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('[id$="Modal"]').forEach(modal => {
        modal.classList.add('hidden');
    });
}

// Load matchmaking requests
async function loadMatchmakingRequests() {
    try {
        const response = await fetch(`${API_BASE}/matchmaking/my-search`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('cripta_token')}`
            }
        });

        const list = document.getElementById('matchmakingRequestsList');
        
        if (response.ok) {
            const result = await response.json();
            if (result.search) {
                const search = result.search;
                list.innerHTML = `
                    <div class="bg-dark-umbra/50 rounded-lg p-4 border border-neon-violet/30">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-neon-violet font-bold">Búsqueda Activa</span>
                            <span class="text-gray-400 text-sm">${new Date(search.timestamp).toLocaleString()}</span>
                        </div>
                        <p class="text-white">Clase: ${search.playerClass}</p>
                        <p class="text-gray-400">Disponibilidad: ${Object.keys(search.availability).join(', ')}</p>
                    </div>
                `;
            } else {
                list.innerHTML = '<p class="text-gray-400 text-center">No tienes solicitudes activas</p>';
            }
        } else {
            list.innerHTML = '<p class="text-gray-400 text-center">Error cargando solicitudes</p>';
        }
    } catch (error) {
        console.error('Error loading matchmaking requests:', error);
        document.getElementById('matchmakingRequestsList').innerHTML = '<p class="text-gray-400 text-center">Error de conexión</p>';
    }
}

// Load notifications
async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE}/users/notifications`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('cripta_token')}`
            }
        });

        const list = document.getElementById('notificationsList');
        
        if (response.ok) {
            const result = await response.json();
            const notifications = result.notifications || [];
            
            if (notifications.length === 0) {
                list.innerHTML = '<p class="text-gray-400 text-center">No tienes notificaciones</p>';
            } else {
                list.innerHTML = notifications.map(notif => `
                    <div class="bg-dark-umbra/50 rounded-lg p-4 border border-neon-violet/30">
                        <p class="text-white">${notif.message}</p>
                        <p class="text-gray-400 text-sm mt-1">${new Date(notif.timestamp).toLocaleString()}</p>
                    </div>
                `).join('');
            }
        } else {
            list.innerHTML = '<p class="text-gray-400 text-center">Error cargando notificaciones</p>';
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        document.getElementById('notificationsList').innerHTML = '<p class="text-gray-400 text-center">Error de conexión</p>';
    }
}

// Logout
async function logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        try {
            await fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cripta_token')}`
                }
            });
        } catch (error) {
            console.error('Error during logout:', error);
        }
        
        localStorage.removeItem('cripta_token');
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('your_matchmaking_search');
        window.location.href = 'login.html';
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserMenu);
} else {
    initUserMenu();
}
