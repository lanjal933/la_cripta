/**
 * Sistema de Guía de Creación de Personajes
 * Wizard dinámico para crear personajes de D&D
 * Arquitectura escalable para integración con panel admin
 */

class CharacterGuideSystem {
    constructor() {
        this.currentClass = null;
        this.currentStep = 0;
        this.classes = [];
        this.progressKey = 'character_guide_progress';
        
        // Inicializar el sistema
        this.init();
    }

    /**
     * Inicializa el sistema de guía
     */
    init() {
        this.loadClasses();
        this.renderClassSelection();
        this.loadProgress();
    }

    /**
     * Parsea texto Markdown a HTML
     */
    parseMarkdown(text) {
        if (!text) return '';
        let html = text;
        
        // Primero procesar párrafos (doble salto de línea)
        html = html.replace(/\n\n/g, '</p><p class="text-gray-300 mb-4">');
        html = '<p class="text-gray-300 mb-4">' + html + '</p>';
        
        // Procesar Markdown
        html = html.replace(/^>\s*(.+)$/gm, '<h3 class="font-title text-xl text-neon-violet mb-2">$1</h3>');
        html = html.replace(/^# (.+)$/gm, '<h3 class="font-title text-xl text-neon-violet mb-2">$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h4 class="font-title text-lg text-neon-violet mb-2">$1</h4>');
        html = html.replace(/^-\s*(.+)$/gm, '<li class="text-gray-300 ml-4">$1</li>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em class="text-gray-300 italic">$1</em>');
        html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-neon-violet px-2 py-1 rounded text-sm">$1</code>');
        html = html.replace(/#([0-9a-fA-F]{6})(.+?)(?=#|$)/g, '<span style="color:#$1">$2</span>');
        
        // Convertir saltos de línea simples a <br> dentro de párrafos
        html = html.replace(/\n/g, '<br>');
        
        return html;
    }

    /**
     * Carga las clases desde localStorage
     */
    loadClasses() {
        const savedClasses = localStorage.getItem('character_guide_classes');
        if (savedClasses) {
            try {
                this.classes = JSON.parse(savedClasses);
                // Migrar datos antiguos con 'phases' a 'steps'
                this.migrateData();
            } catch (e) {
                console.error('Error al cargar clases:', e);
                this.classes = this.getDefaultClasses();
            }
        } else {
            this.classes = this.getDefaultClasses();
        }
    }

    /**
     * Migrar datos antiguos con 'phases' a 'steps'
     */
    migrateData() {
        let needsSave = false;
        this.classes.forEach(cls => {
            if (cls.phases && !cls.steps) {
                cls.steps = cls.phases;
                delete cls.phases;
                needsSave = true;
            }
        });
        if (needsSave) {
            localStorage.setItem('character_guide_classes', JSON.stringify(this.classes));
        }
    }

    /**
     * Retorna las clases por defecto con datos de ejemplo
     */
    getDefaultClasses() {
        return [
            {
                id: 'barbaro',
                name: 'Bárbaro',
                description: 'Guerrero salvaje con fuerza bruta y furia desatada',
                icon: '⚔️',
                steps: [
                    {
                        title: 'Origen del Bárbaro',
                        description: 'Elige el origen de tu bárbaro. Esto determinará tu motivación y trasfondo.',
                        instructions: '> Selecciona un origen que resuene con tu personaje\n\nConsidera cómo este origen afecta tu personalidad\n\nPiensa en qué te motivó a convertirse en aventurero',
                        image: 'https://via.placeholder.com/600x300/8b5cf6/ffffff?text=Origen+del+Bárbaro',
                        video: '',
                        links: [
                            { title: 'Guía de Orígenes', url: '#' },
                            { title: 'Trasfondos Comunes', url: '#' }
                        ],
                        notes: 'El origen afecta tus habilidades iniciales y ventajas de trasfondo.',
                        customContent: ''
                    },
                    {
                        title: 'Atributos Principales',
                        description: 'Los bárbaros se especializan en Fuerza y Constitución.',
                        instructions: '- Prioriza **Fuerza** para daño melee\n\n- Constitución es vital para supervivencia\n\n- Considera *Destreza* para armadura ligera',
                        image: 'https://via.placeholder.com/600x300/7c3aed/ffffff?text=Atributos+Principales',
                        video: '',
                        links: [
                            { title: 'Generador de Atributos', url: '#' },
                            { title: 'Puntos de Compra', url: '#' }
                        ],
                        notes: 'Usa el sistema de puntos de compra para mayor flexibilidad.',
                        customContent: ''
                    },
                    {
                        title: 'Furia Primitiva',
                        description: 'Tu habilidad principal es la Furia Primitiva.',
                        instructions: '> Puedes entrar en furia como acción bonus\n\nGanas ventaja en ataques con Fuerza\n\nResistencia a daño físico mientras estás furioso\n\nDuración: número de rondas igual a tu bonificador de proficiencia',
                        image: '',
                        video: '',
                        links: [
                            { title: 'Reglas de Furia', url: '#' }
                        ],
                        notes: 'La furia no se puede usar si estás usando armadura pesada.',
                        customContent: ''
                    },
                    {
                        title: 'Camino Primitivo',
                        description: 'Elige tu camino primitivo al nivel 3.',
                        instructions: '- Camino del Berserker: Más daño y furia\n\n- Camino del Tótem: Espíritus animales y protección\n\n- Camino del Tempestad: Magia de tormenta',
                        image: '',
                        video: '',
                        links: [
                            { title: 'Caminos Primitivos', url: '#' }
                        ],
                        notes: 'El camino primitivo define tu estilo de juego a largo plazo.',
                        customContent: ''
                    }
                ]
            },
            {
                id: 'bardo',
                name: 'Bardo',
                description: 'Maestro de la música y la magia, inspirador de aliados',
                icon: '🎭',
                steps: [
                    {
                        title: 'Colegio de Bardos',
                        description: 'Elige tu especialización como bardo.',
                        instructions: [
                            'Colegio de Valor: Combate melee',
                            'Colegio de Ingenio: Magia y trucos',
                            'Colegio de Gloria: Inspiración divina'
                        ]
                    },
                    {
                        title: 'Atributos Principales',
                        description: 'Los bardos se especializan en Carisma y Destreza.',
                        instructions: [
                            'Carisma es esencial para hechizos e inspiración',
                            'Destreza para armadura y iniciativa',
                            'Constitución para puntos de vida'
                        ]
                    },
                    {
                        title: 'Inspiración de Bardo',
                        description: 'Tu habilidad principal es la Inspiración de Bardo.',
                        instructions: [
                            'Usa dado de inspiración igual a tu nivel de bardo',
                            'Aliados pueden usar para reroll',
                            'Recuperas usos tras descanso largo',
                            'Puedes usar en ti mismo con Colegio de Valor'
                        ]
                    }
                ]
            },
            {
                id: 'guerrero',
                name: 'Guerrero',
                description: 'Maestro del combate y tácticas de batalla',
                icon: '🛡️',
                steps: [
                    {
                        title: 'Arquetipo de Combate',
                        description: 'Elige tu especialización en combate.',
                        instructions: [
                            'Campeón: Críticos mejorados y resistencia',
                            'Maestro de Batalla: Tácticas de combate',
                            'Caballero Espectral: Invocar espíritu'
                        ]
                    },
                    {
                        title: 'Atributos Principales',
                        description: 'Los guerreros se especializan en Fuerza y Constitución.',
                        instructions: [
                            'Fuerza para daño melee',
                            'Constitución para puntos de vida y resistencia',
                            'Destreza si usas armas a distancia'
                        ]
                    },
                    {
                        title: 'Acción de Ataque',
                        description: 'Tu habilidad principal es la Acción de Ataque.',
                        instructions: [
                            'Puedes atacar 2 veces por acción',
                            'Aumenta a 3 ataques al nivel 11',
                            'Aumenta a 4 ataques al nivel 20',
                            'Usa tu bonificador de proficiencia'
                        ]
                    }
                ]
            },
            {
                id: 'mago',
                name: 'Mago',
                description: 'Maestro de la magia arcana y conocimiento',
                icon: '🧙',
                steps: [
                    {
                        title: 'Tradición Arcana',
                        description: 'Elige tu especialización mágica.',
                        instructions: [
                            'Evocación: Magia ofensiva de fuego y hielo',
                            'Conjuración: Invocar criaturas',
                            'Nigromancia: Magia de muerte y vida',
                            'Ilusión: Engaños y manipulación'
                        ]
                    },
                    {
                        title: 'Atributos Principales',
                        description: 'Los magos se especializan en Inteligencia.',
                        instructions: [
                            'Inteligencia es esencial para hechizos',
                            'Constitución para puntos de vida',
                            'Sabiduría para percepción'
                        ]
                    },
                    {
                        title: 'Recuperación Arcana',
                        description: 'Tu habilidad principal es la Recuperación Arcana.',
                        instructions: [
                            'Recuperas espacios de hechizo tras descanso corto',
                            'Solo hechizos de nivel 1-2 al inicio',
                            'Aumenta a nivel 3-5 al nivel 7',
                            'Aumenta a nivel 6-9 al nivel 17'
                        ]
                    }
                ]
            },
            {
                id: 'clerigo',
                name: 'Clérigo',
                description: 'Siervo divino con poder de curación y protección',
                icon: '✨',
                steps: [
                    {
                        title: 'Dominio Divino',
                        description: 'Elige tu especialización divina.',
                        instructions: [
                            'Dominio de Vida: Curación y protección',
                            'Dominio de Luz: Fuego y radiación',
                            'Dominio de Tempestad: Tormenta y destrucción',
                            'Dominio de Guerra: Combate y ofensiva'
                        ]
                    },
                    {
                        title: 'Atributos Principales',
                        description: 'Los clérigos se especializan en Sabiduría.',
                        instructions: [
                            'Sabiduría es esencial para hechizos',
                            'Constitución para puntos de vida',
                            'Carisma si usas Dominio de Luz'
                        ]
                    },
                    {
                        title: 'Canalizar Divinidad',
                        description: 'Tu habilidad principal es Canalizar Divinidad.',
                        instructions: [
                            'Usos iguales a tu modificador de Sabiduría',
                            'Recuperas tras descanso largo',
                            'Efectos varían por dominio',
                            'Puede usarse 1 vez entre descansos cortos'
                        ]
                    }
                ]
            },
            {
                id: 'picaro',
                name: 'Pícaro',
                description: 'Maestro del sigilo, engaño y combate sigiloso',
                icon: '🗡️',
                steps: [
                    {
                        title: 'Arquetipo de Pícaro',
                        description: 'Elige tu especialización.',
                        instructions: [
                            'Ladrón: Sigilo y desactivación de trampas',
                            'Asesino: Ataques sorpresa y veneno',
                            'Arcano Trickster: Magia y engaños',
                            'Fantasma: Invisibilidad y teleportación'
                        ]
                    },
                    {
                        title: 'Atributos Principales',
                        description: 'Los pícaros se especializan en Destreza.',
                        instructions: [
                            'Destreza es esencial para armadura y daño',
                            'Constitución para puntos de vida',
                            'Carisma para habilidades sociales',
                            'Inteligencia para investigación'
                        ]
                    },
                    {
                        title: 'Ataque Furtivo',
                        description: 'Tu habilidad principal es el Ataque Furtivo.',
                        instructions: [
                            'Dado extra de daño si tienes ventaja',
                            'No funciona si el enemigo puede verte',
                            'Funciona con aliados a 1.5m del enemigo',
                            'Críticos en 19-20 con Arquetipo de Asesino'
                        ]
                    }
                ]
            },
            {
                id: 'druida',
                name: 'Druida',
                description: 'Guardián de la naturaleza con poder de transformación',
                icon: '🌿',
                steps: [
                    {
                        title: 'Círculo Druida',
                        description: 'Elige tu especialización.',
                        instructions: [
                            'Círculo de la Tierra: Magia elemental',
                            'Círculo de la Luna: Forma de bestia combativa',
                            'Círculo del Bosque: Control de plantas'
                        ]
                    },
                    {
                        title: 'Atributos Principales',
                        description: 'Los druidas se especializan en Sabiduría.',
                        instructions: [
                            'Sabiduría es esencial para hechizos',
                            'Constitución para puntos de vida',
                            'Destreza para armadura ligera'
                        ]
                    },
                    {
                        title: 'Forma Salvaje',
                        description: 'Tu habilidad principal es la Forma Salvaje.',
                        instructions: [
                            'Puedes transformarte en bestias',
                            'Usos iguales a tu nivel/2 (mínimo 1)',
                            'Recuperas tras descanso corto',
                            'Círculo de la Luna tiene usos ilimitados'
                        ]
                    }
                ]
            },
            {
                id: 'paladin',
                name: 'Paladín',
                description: 'Guerrero sagrado con poder divino y protección',
                icon: '⚔️',
                steps: [
                    {
                        title: 'Juramento Sagrado',
                        description: 'Elige tu juramento.',
                        instructions: [
                            'Juramento de Devoción: Luz y bondad',
                            'Juramento de los Ancestrales: Sabiduría antigua',
                            'Juramento de Venganza: Castigo divino',
                            'Juramento de Redención: Misericordia'
                        ]
                    },
                    {
                        title: 'Atributos Principales',
                        description: 'Los paladines se especializan en Fuerza y Carisma.',
                        instructions: [
                            'Fuerza para daño melee',
                            'Carisma para hechizos y auras',
                            'Constitución para puntos de vida'
                        ]
                    },
                    {
                        title: 'Sentido Divino',
                        description: 'Tu habilidad principal es el Sentido Divino.',
                        instructions: [
                            'Detectas criaturas celestiales, infernales y no muertas',
                            'Rango de 18 metros',
                            'Usos iguales a tu modificador de Carisma',
                            'Recuperas tras descanso largo'
                        ]
                    }
                ]
            }
        ];
    }

    /**
     * Renderiza la selección de clases
     */
    renderClassSelection() {
        const grid = document.getElementById('classGrid');
        const noClassesMsg = document.getElementById('noClassesMessage');

        if (this.classes.length === 0) {
            grid.classList.add('hidden');
            noClassesMsg.classList.remove('hidden');
            return;
        }

        grid.innerHTML = '';
        noClassesMsg.classList.add('hidden');

        this.classes.forEach(cls => {
            const card = document.createElement('div');
            card.className = 'class-card rounded-lg p-6 text-center';
            card.innerHTML = `
                <div class="text-4xl mb-3">${cls.icon}</div>
                <h3 class="font-title text-xl text-neon-violet mb-2">${cls.name}</h3>
                <p class="text-sm text-gray-400">${cls.description}</p>
            `;
            card.onclick = () => this.selectClass(cls.id);
            grid.appendChild(card);
        });
    }

    /**
     * Selecciona una clase y comienza el wizard
     */
    selectClass(classId) {
        this.currentClass = this.classes.find(c => c.id === classId);
        if (!this.currentClass) return;

        this.currentStep = 0;
        this.showWizard();
        this.renderStep();
        this.saveProgress();
    }

    /**
     * Muestra la pantalla del wizard
     */
    showWizard() {
        document.getElementById('classSelectionScreen').classList.add('hidden');
        document.getElementById('wizardScreen').classList.remove('hidden');
        document.getElementById('completionScreen').classList.add('hidden');
    }

    /**
     * Renderiza el paso actual
     */
    renderStep() {
        const step = this.currentClass.steps[this.currentStep];
        const content = document.getElementById('wizardContent');
        const totalSteps = this.currentClass.steps.length;

        // Actualizar barra de progreso
        const progress = ((this.currentStep + 1) / totalSteps) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${Math.round(progress)}%`;

        // Renderizar indicadores de paso
        this.renderStepIndicators();

        // Renderizar contenido del paso
        let html = `
            <div class="wizard-content">
                <h2 class="font-title text-3xl text-neon-violet mb-4">${step.title}</h2>
                <p class="text-gray-300 text-lg mb-6">${step.description}</p>
        `;

        if (step.image) {
            html += `
                <div class="media-container mb-6">
                    <img src="${step.image}" alt="${step.title}" class="rounded-lg">
                </div>
            `;
        }

        if (step.video) {
            html += `
                <div class="media-container mb-6">
                    <video controls class="rounded-lg">
                        <source src="${step.video}" type="video/mp4">
                        Tu navegador no soporta video.
                    </video>
                </div>
            `;
        }

        if (step.instructions) {
            html += `
                <div class="mb-6">
                    <h3 class="font-title text-xl text-neon-violet mb-4">Instrucciones:</h3>
                    <div class="text-gray-300">${this.parseMarkdown(step.instructions)}</div>
                </div>
            `;
        }

        if (step.links && step.links.length > 0) {
            html += `
                <div class="mb-6">
                    <h3 class="font-title text-xl text-neon-violet mb-4">Enlaces Útiles:</h3>
                    <div class="flex flex-wrap gap-3">
            `;
            step.links.forEach(link => {
                html += `
                    <a href="${link.url}" target="_blank" class="btn-secondary px-4 py-2 rounded-lg text-sm">
                        ${link.title} ↗
                    </a>
                `;
            });
            html += `
                    </div>
                </div>
            `;
        }

        if (step.notes) {
            html += `
                <div class="mb-6 bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                    <h3 class="font-title text-lg text-yellow-500 mb-2">📝 Notas:</h3>
                    <p class="text-gray-300">${step.notes}</p>
                </div>
            `;
        }

        if (step.customContent) {
            html += `
                <div class="mb-6 bg-gray-800 p-4 rounded">
                    <h3 class="font-title text-lg text-neon-violet mb-2">Contenido Personalizado:</h3>
                    <div class="text-gray-300">${step.customContent}</div>
                </div>
            `;
        }

        html += `
            </div>
        `;

        content.innerHTML = html;

        // Actualizar botones
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        prevBtn.classList.toggle('hidden', this.currentStep === 0);
        nextBtn.textContent = this.currentStep === totalSteps - 1 ? 'Completar ✓' : 'Siguiente →';
    }

    /**
     * Renderiza los indicadores de paso
     */
    renderStepIndicators() {
        const container = document.getElementById('stepIndicators');
        const totalSteps = this.currentClass.steps.length;

        container.innerHTML = '';

        for (let i = 0; i < totalSteps; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'step-indicator w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gray-700 text-gray-400';
            
            if (i < this.currentStep) {
                indicator.classList.add('completed');
                indicator.textContent = '✓';
            } else if (i === this.currentStep) {
                indicator.classList.add('active');
                indicator.textContent = i + 1;
            } else {
                indicator.textContent = i + 1;
            }

            container.appendChild(indicator);
        }
    }

    /**
     * Avanza al siguiente paso
     */
    nextStep() {
        const totalSteps = this.currentClass.steps.length;

        if (this.currentStep < totalSteps - 1) {
            this.currentStep++;
            this.renderStep();
            this.saveProgress();
        } else {
            this.showCompletion();
        }
    }

    /**
     * Retrocede al paso anterior
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
            this.saveProgress();
        }
    }

    /**
     * Muestra la pantalla de completado
     */
    showCompletion() {
        document.getElementById('wizardScreen').classList.add('hidden');
        document.getElementById('completionScreen').classList.remove('hidden');
        this.clearProgress();
    }

    /**
     * Reinicia el wizard
     */
    restartWizard() {
        this.currentClass = null;
        this.currentStep = 0;
        this.clearProgress();
        this.showClassSelection();
    }

    /**
     * Cierra el wizard y vuelve a la selección de clase
     */
    closeWizard() {
        this.currentClass = null;
        this.currentStep = 0;
        this.clearProgress();
        this.showClassSelection();
    }

    /**
     * Muestra la selección de clase
     */
    showClassSelection() {
        document.getElementById('classSelectionScreen').classList.remove('hidden');
        document.getElementById('wizardScreen').classList.add('hidden');
        document.getElementById('completionScreen').classList.add('hidden');
    }

    /**
     * Guarda el progreso en localStorage
     */
    saveProgress() {
        const progress = {
            classId: this.currentClass ? this.currentClass.id : null,
            step: this.currentStep
        };
        localStorage.setItem(this.progressKey, JSON.stringify(progress));
    }

    /**
     * Carga el progreso desde localStorage
     */
    loadProgress() {
        const savedProgress = localStorage.getItem(this.progressKey);
        if (savedProgress) {
            try {
                const progress = JSON.parse(savedProgress);
                if (progress.classId) {
                    this.selectClass(progress.classId);
                    this.currentStep = progress.step || 0;
                    this.renderStep();
                }
            } catch (e) {
                console.error('Error al cargar progreso:', e);
            }
        }
    }

    /**
     * Limpia el progreso guardado
     */
    clearProgress() {
        localStorage.removeItem(this.progressKey);
    }
}

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.characterGuide = new CharacterGuideSystem();
});

// Funciones globales para botones
function previousStep() {
    window.characterGuide.previousStep();
}

function nextStep() {
    window.characterGuide.nextStep();
}

function restartWizard() {
    window.characterGuide.restartWizard();
}

function closeWizard() {
    window.characterGuide.closeWizard();
}
