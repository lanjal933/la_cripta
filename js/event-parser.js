/**
 * Sistema de Creación de Eventos - Estilo Discord
 * Parser de texto plano a objeto de evento estructurado
 * Sintaxis Markdown: > para título, - para detalles, ` para datos técnicos
 */

class EventParser {
    constructor() {
        // Patrones de sintaxis para extraer datos (nueva sintaxis Markdown)
        this.patterns = {
            title: /^>\s*(.+)$/m,              // > Título del evento
            date: /-\s*Fecha:\s*(\d{4}-\d{2}-\d{2})/,  // - Fecha: 2024-06-15
            time: /-\s*Hora:\s*(\d{2}:\d{2})/,  // - Hora: 14:30
            type: /-\s*Tipo:\s*(\w+)/,          // - Tipo: evento
            description: /-\s*Descripción:\s*(.+)$/,  // - Descripción: texto
            location: /-\s*Ubicación:\s*(.+)$/,  // - Ubicación: texto
            priority: /-\s*Prioridad:\s*(alta|media|baja)/,  // - Prioridad: alta
            tags: /`([^`]+)`/g                   // `etiqueta` para datos técnicos
        };

        // Mapeo de tipos a colores (estilo Discord)
        this.typeColors = {
            'evento': '#5865F2',
            'reunion': '#3BA55C',
            'anuncio': '#ED4245',
            'recordatorio': '#FAA61A',
            'tarea': '#00B0F4'
        };
    }

    /**
     * Parsea el texto del textarea y retorna un objeto de evento
     * @param {string} text - Texto plano del textarea
     * @returns {Object} Objeto de evento estructurado
     */
    parse(text) {
        const event = {
            raw: text,
            title: this.extract(text, this.patterns.title) || 'Sin título',
            date: this.extract(text, this.patterns.date) || this.getToday(),
            time: this.extract(text, this.patterns.time) || '00:00',
            type: this.extract(text, this.patterns.type) || 'evento',
            description: this.extract(text, this.patterns.description) || '',
            location: this.extract(text, this.patterns.location) || '',
            priority: this.extract(text, this.patterns.priority) || 'media',
            tags: this.extractAll(text, this.patterns.tags) || [],
            color: this.getTypeColor(this.extract(text, this.patterns.type) || 'evento')
        };

        // Limpiar el texto removiendo los patrones de sintaxis
        event.cleanText = this.cleanSyntax(text);

        return event;
    }

    /**
     * Extrae el primer match de un patrón regex
     * @param {string} text - Texto a analizar
     * @param {RegExp} pattern - Patrón regex
     * @returns {string|null} Valor extraído o null
     */
    extract(text, pattern) {
        const match = text.match(pattern);
        return match ? match[1] : null;
    }

    /**
     * Extrae todos los matches de un patrón regex
     * @param {string} text - Texto a analizar
     * @param {RegExp} pattern - Patrón regex
     * @returns {Array} Array de valores extraídos
     */
    extractAll(text, pattern) {
        const matches = [];
        let match;
        const regex = new RegExp(pattern.source, pattern.flags + 'g');
        
        while ((match = regex.exec(text)) !== null) {
            matches.push(match[1]);
        }
        
        return matches;
    }

    /**
     * Obtiene el color correspondiente al tipo de evento
     * @param {string} type - Tipo de evento
     * @returns {string} Color en formato hex
     */
    getTypeColor(type) {
        return this.typeColors[type.toLowerCase()] || '#5865F2';
    }

    /**
     * Retorna la fecha actual en formato YYYY-MM-DD
     * @returns {string} Fecha actual
     */
    getToday() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    /**
     * Limpia el texto removiendo la sintaxis de parsing
     * @param {string} text - Texto original
     * @returns {string} Texto limpio
     */
    cleanSyntax(text) {
        let clean = text;
        
        // Remover todos los patrones de sintaxis (nueva sintaxis Markdown)
        clean = clean.replace(this.patterns.title, '$1');
        clean = clean.replace(this.patterns.date, '');
        clean = clean.replace(this.patterns.time, '');
        clean = clean.replace(this.patterns.type, '');
        clean = clean.replace(this.patterns.description, '$1');
        clean = clean.replace(this.patterns.location, '');
        clean = clean.replace(this.patterns.priority, '');
        clean = clean.replace(this.patterns.tags, '$1');
        
        // Limpiar espacios extra
        clean = clean.trim().replace(/\s+/g, ' ');
        
        return clean;
    }

    /**
     * Valida que el evento tenga los campos requeridos
     * @param {Object} event - Objeto de evento
     * @returns {Object} Objeto con isValid y errors
     */
    validate(event) {
        const errors = [];
        
        if (!event.title || event.title === 'Sin título') {
            errors.push('El título es requerido (usa > Título)');
        }
        
        if (!this.isValidDate(event.date)) {
            errors.push('La fecha debe estar en formato YYYY-MM-DD (usa - Fecha: YYYY-MM-DD)');
        }
        
        if (!this.isValidTime(event.time)) {
            errors.push('La hora debe estar en formato HH:MM (usa - Hora: HH:MM)');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Valida formato de fecha
     * @param {string} date - Fecha en formato YYYY-MM-DD
     * @returns {boolean} True si es válido
     */
    isValidDate(date) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(date)) return false;
        
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    }

    /**
     * Valida formato de hora
     * @param {string} time - Hora en formato HH:MM
     * @returns {boolean} True si es válido
     */
    isValidTime(time) {
        const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return regex.test(time);
    }

    /**
     * Genera HTML para mostrar el evento (preview)
     * @param {Object} event - Objeto de evento
     * @returns {string} HTML del evento
     */
    generatePreviewHTML(event) {
        return `
            <div class="event-preview" style="
                background: #2f3136;
                border-left: 4px solid ${event.color};
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 12px;
            ">
                <div class="event-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <h3 style="margin: 0; font-size: 18px; color: #ffffff;">${event.title}</h3>
                    <span style="
                        background: ${event.color};
                        color: white;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: bold;
                    ">#${event.type}</span>
                </div>
                <div class="event-details" style="color: #b9bbbe; font-size: 14px; margin-bottom: 8px;">
                    <span>📅 ${event.date}</span>
                    <span style="margin-left: 16px;">⏰ ${event.time}</span>
                    ${event.location ? `<span style="margin-left: 16px;">📍 ${event.location}</span>` : ''}
                    ${event.priority ? `<span style="margin-left: 16px;">⚡ ${event.priority}</span>` : ''}
                </div>
                ${event.description ? `<p style="color: #dcddde; margin: 8px 0;">${event.description}</p>` : ''}
                ${event.tags.length > 0 ? `
                    <div style="margin-top: 8px;">
                        ${event.tags.map(tag => `<span style="background: #5865F2; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 4px;">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
}

/**
 * Inicializador del sistema de eventos
 */
class EventSystem {
    constructor() {
        this.parser = new EventParser();
        this.textarea = null;
        this.previewContainer = null;
        this.createButton = null;
        this.currentEvent = null;
    }

    /**
     * Inicializa el sistema en un elemento específico
     * @param {string} textareaId - ID del textarea
     * @param {string} previewId - ID del contenedor de preview
     * @param {string} buttonId - ID del botón de crear
     */
    init(textareaId, previewId, buttonId) {
        this.textarea = document.getElementById(textareaId);
        this.previewContainer = document.getElementById(previewId);
        this.createButton = document.getElementById(buttonId);

        if (!this.textarea || !this.previewContainer || !this.createButton) {
            console.error('Error: No se encontraron los elementos necesarios');
            return;
        }

        // Event listeners
        this.textarea.addEventListener('input', () => this.handleInput());
        this.createButton.addEventListener('click', () => this.handleCreate());

        // Placeholder con sintaxis
        this.setPlaceholder();
    }

    /**
     * Establece el placeholder con ejemplos de sintaxis (nueva sintaxis Markdown)
     */
    setPlaceholder() {
        this.textarea.placeholder = `Escribe tu evento aquí...

Ejemplo:
> Reunión de equipo
- Fecha: 2024-06-15
- Hora: 14:30
- Tipo: reunion
- Descripción: Discutir el progreso del proyecto
- Ubicación: Sala de conferencias
- Prioridad: alta
\`proyecto\` \`urgente\``;
    }

    /**
     * Maneja el input del textarea (preview en tiempo real)
     */
    handleInput() {
        const text = this.textarea.value;
        
        if (!text.trim()) {
            this.previewContainer.innerHTML = '<p style="color: #72767d;">Escribe para ver el preview...</p>';
            return;
        }

        this.currentEvent = this.parser.parse(text);
        this.previewContainer.innerHTML = this.parser.generatePreviewHTML(this.currentEvent);
    }

    /**
     * Maneja el clic en el botón de crear
     */
    handleCreate() {
        if (!this.currentEvent) {
            this.currentEvent = this.parser.parse(this.textarea.value);
        }

        const validation = this.parser.validate(this.currentEvent);

        if (!validation.isValid) {
            alert('Errores de validación:\n' + validation.errors.join('\n'));
            return;
        }

        // Aquí puedes agregar la lógica para guardar el evento
        console.log('Evento creado:', this.currentEvent);
        alert('✅ Evento creado exitosamente!\n\n' + JSON.stringify(this.currentEvent, null, 2));

        // Limpiar el textarea
        this.textarea.value = '';
        this.previewContainer.innerHTML = '<p style="color: #72767d;">Escribe para ver el preview...</p>';
        this.currentEvent = null;
    }
}

// Exportar para uso global
window.EventParser = EventParser;
window.EventSystem = EventSystem;
