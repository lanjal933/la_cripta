/**
 * Sistema de Administración de Guía de Personajes
 * Sistema dedicado exclusivamente para gestionar clases y fases de creación de personajes
 */

class CharacterGuideAdmin {
    constructor() {
        this.classes = [];
        this.currentClass = null;
        this.currentPhaseIndex = null;
        this.storageKey = 'character_guide_classes';
        
        this.init();
    }

    /**
     * Inicializa el sistema
     */
    async init() {
        this.loadClasses();
        
        // Si no hay clases, crear las clases por defecto
        if (this.classes.length === 0) {
            this.createDefaultClasses();
        } else {
            // Si hay clases pero faltan algunas, agregar las faltantes
            this.addMissingClasses();
        }
        
        this.renderClassList();
        this.setupDragAndDrop();
        
        // Agregar fases desde datos incrustados
        this.addPhasesFromData();
    }

    /**
     * Agrega las clases que faltan (sin sobrescribir fases existentes)
     */
    addMissingClasses() {
        const barbaroPhase1 = {
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
        };

        const defaultClasses = [
            { id: 'artifice', name: 'Artífice', description: 'Inventor y creador de artefactos mágicos', icon: '🛠️' },
            { id: 'barbaro', name: 'Bárbaro', description: 'Guerrero salvaje con fuerza bruta y furia desatada', icon: '🪓' },
            { id: 'bardo', name: 'Bardo', description: 'Maestro de la música y la magia de inspiración', icon: '🪕' },
            { id: 'brujo', name: 'Brujo', description: 'Usuario de magia pactada con entidades sobrenaturales', icon: '👁️' },
            { id: 'clerigo', name: 'Clérigo', description: 'Sacerdote guerrero con poder divino', icon: '🛡️' },
            { id: 'druida', name: 'Druida', description: 'Guardián de la naturaleza con poder de transformación', icon: '🐻' },
            { id: 'explorador', name: 'Explorador', description: 'Rastreador experto y maestro del combate a distancia', icon: '🏹' },
            { id: 'guerrero', name: 'Guerrero', description: 'Maestro del combate con todas las armas y armaduras', icon: '⚔️' },
            { id: 'hechicero', name: 'Hechicero', description: 'Usuario de magia innata y poder arcano', icon: '🔮' },
            { id: 'mago', name: 'Mago', description: 'Erudito de la magia arcana con versatilidad', icon: '🧙‍♂️' },
            { id: 'monje', name: 'Monje', description: 'Guerrero disciplinado con poderes ki', icon: '🥋' },
            { id: 'paladin', name: 'Paladín', description: 'Caballero sagrado con poder divino', icon: '🛡️✨' },
            { id: 'picaro', name: 'Pícaro', description: 'Maestro del sigilo, engaño y combate sigiloso', icon: '🗡️' },
            { id: 'pugilista', name: 'Pugilista', description: 'Guerrero de combate cuerpo a cuerpo sin armas', icon: '🥊' }
        ];

        let needsSave = false;
        defaultClasses.forEach(defaultClass => {
            const existing = this.classes.find(c => c.id === defaultClass.id);
            if (!existing) {
                // Crear nueva clase
                this.classes.push({
                    ...defaultClass,
                    steps: [JSON.parse(JSON.stringify(barbaroPhase1))]
                });
                needsSave = true;
            } else if (defaultClass.id !== 'guerrero' && existing.steps.length > 0) {
                // Reemplazar fase 1 con la del bárbaro (excepto guerrero)
                const barbaroClass = this.classes.find(c => c.id === 'barbaro');
                if (barbaroClass && barbaroClass.steps.length > 0) {
                    existing.steps[0] = JSON.parse(JSON.stringify(barbaroClass.steps[0]));
                    needsSave = true;
                }
            }
        });

        if (needsSave) {
            this.saveClasses();
        }
    }

    /**
     * Agrega fases desde datos incrustados
     */
    addPhasesFromData() {
        const phaseData = this.getEmbeddedPhaseData();
        this.parseAndAddPhases(phaseData);
    }

    /**
     * Retorna los datos de fases incrustados
     */
    getEmbeddedPhaseData() {
        return `# 💪 Bárbaro 

\`\`\`
Fase 2:
> Características :

   1. Características recomendadas: Fuerza y Constitución como atributos altos; Destreza como atributo medio.

2. Idea de reparto:
 - FUE: 15 (Alto)
 - CON: 15 (Alto)
 - DES: 14 (Medio)
 - SAB: 10 (Medio)
 - INT: 8 (Bajo)
 - CAR: 8 (Bajo)

Fase 3:
> Equipo inicial:
Por clase obtienes un equipo inicial de eleccion entre A o B. Elige uni de los siguientes objetos de esta lista:

1. Eligui tu Equipo Inicial:
seleccionabentre a o b por línea 
- A elegir entre: (a) un gran hacha o (b) un arma marcial cuerpo a cuerpo a tu elección.
- A elegir entre: (a) dos hachas de mano o (b) un arma sencilla a tu elección.
- Un paquete de explorador y cuatro jabalinas.

2. Añadilas desde \`equipo/añadir\`
3. Si elegís las 4 jabalinas anda a editar en él objeto, municion y pones 4. Lo mismo si eleguis cualquier cosa con municion 

—————
\`\`\`


# Mago
\`\`\`
Fase 2:
> Características :

1. Características recomendadas: Inteligencia como atributo alto; Constitución y Destreza como atributos medios.

2. Idea de reparto:
 - INT: 15 (Alto)
 - CON: 14 (Medio)
 - DES: 14 (Medio)
 - SAB: 12 (Medio)
 - CAR: 10 (Bajo)
 - FUE: 8 (Bajo)

Fase 3:
> Equipo inicial:
Por clase obtienes un equipo inicial de elección entre A o B. Elige uno de los siguientes objetos de esta lista:

1. Elegí tu Equipo Inicial:
selecciona entre a o b por línea

- A elegir entre: (a) un bastón o (b) una daga.
- A elegir entre: (a) una bolsa de componentes o (b) un foco arcano.
- A elegir entre: (a) un paquete de erudito o (b) un paquete de explorador.
- Un libro de conjuros.

2. Añadilas desde \`equipo/añadir\`

3. Si algún objeto requiere munición o cargas, edítalo manualmente desde el inventario.

Fase 4:
>  Conjuros
Él mago es una clase computadora lo qué te da acceso a conjuros de la lista de conjuros disponibles para mago.

1. Cantidad de conjuros 
Diruguete a \`conjuros\` y desde hay te aparecer an conjuros "preparados" y "trucos" y un numero por cada uno. Puedes elegir uno de ese tipo (conjuros solo de LV1)

2. Eleguilos:
Enn conjuros diriguite a disponibles. Puedes elegir cualquier Truco y conjuro de LV1 (según la cantidad qué puedes elegir). Asegúrate qué sea de nuestros libros

3. Separar entre Conocidos 
Los conjuros qué hallas eleguidos hasta ahora debes marcarlos con una estrellita (esta al lado). Luego puedes ańadir 6 conjuros más sin estrellita (conocidos)
\`\`\`


# Paladin
\`\`\`
Fase 2:
> Características :

1. Características recomendadas: Fuerza y Carisma como atributos altos; Constitución como atributo medio.

2. Idea de reparto:
 - FUE: 15 (Alto)
 - CAR: 15 (Alto)
 - CON: 14 (Medio)
 - SAB: 10 (Medio)
 - DES: 10 (Medio)
 - INT: 8 (Bajo)

Fase 3:
> Equipo inicial:
Por clase obtienes un equipo inicial de elección entre A o B. Elige uno de los siguientes objetos de esta lista:

1. Elegí tu Equipo Inicial:
selecciona entre a o b por línea

- A elegir entre: (a) un arma marcial y un escudo o (b) dos armas marciales.
- A elegir entre: (a) cinco jabalinas o (b) un arma sencilla cuerpo a cuerpo.
- A elegir entre: (a) un paquete de sacerdote o (b) un paquete de explorador.
- Cota de malla y un símbolo sagrado.

2. Añadilas desde \`equipo/añadir\`

3. Si elegís objetos con munición o cantidad, editá el objeto manualmente desde el inventario.
\`\`\`


# Druida
\`\`\`
Fase 2:
> Características :

1. Características recomendadas: Sabiduría como atributo alto; Constitución y Destreza como atributos medios.

2. Idea de reparto:
 - SAB: 15 (Alto)
 - CON: 14 (Medio)
 - DES: 14 (Medio)
 - INT: 12 (Medio)
 - CAR: 10 (Bajo)
 - FUE: 8 (Bajo)

Fase 3:
> Equipo inicial:
Por clase obtienes un equipo inicial de elección entre A o B. Elige uno de los siguientes objetos de esta lista:

1. Elegí tu Equipo Inicial:
selecciona entre a o b por línea

- A elegir entre: (a) un escudo de madera o (b) cualquier arma sencilla.
- A elegir entre: (a) una cimitarra o (b) cualquier arma sencilla cuerpo a cuerpo.
- Armadura de cuero, paquete de explorador y un foco druídico.

2. Añadilas desde \`equipo/añadir\`

3. Si algún objeto requiere cantidad o munición, editá el valor manualmente desde el inventario.

Fase 4:
> Conjuros
El druida es una clase conjuradora lo que te da acceso a conjuros de la lista de conjuros disponibles para druida.

1. Cantidad de conjuros
Dirigite a \`conjuros\` y revisá la cantidad de conjuros preparados y trucos que puedes seleccionar.

2. Elegilos
En \`conjuros/disponibles\` puedes elegir cualquier truco y conjuro de nivel 1 de la lista de druida (según la cantidad permitida).

3. Prepararlos
Los conjuros elegidos deben marcarse como preparados para poder utilizarlos. Los trucos no necesitan preparación.
\`\`\`



# Bardo
\`\`\`

Fase 2:
> Características :

1. Características recomendadas: Carisma como atributo alto; Destreza y Constitución como atributos medios.

2. Idea de reparto:
 - CAR: 15 (Alto)
 - DES: 14 (Medio)
 - CON: 14 (Medio)
 - SAB: 12 (Medio)
 - INT: 10 (Bajo)
 - FUE: 8 (Bajo)

Fase 3:
> Equipo inicial:
Por clase obtienes un equipo inicial de elección entre A o B. Elige uno de los siguientes objetos de esta lista:

1. Elegí tu Equipo Inicial:
selecciona entre a o b por línea

- A elegir entre: (a) un estoque, (b) una espada larga o (c) cualquier arma sencilla.
- A elegir entre: (a) un paquete de diplomático o (b) un paquete de artista.
- A elegir entre: (a) un laúd o (b) cualquier otro instrumento musical con el que tengas competencia.
- Armadura de cuero y una daga.

2. Añadilas desde \`equipo/añadir\`

3. Si algún objeto posee cargas o cantidad, editá esos valores manualmente.

Fase 4:
> Conjuros
El bardo es una clase conjuradora lo que te da acceso a conjuros de la lista de conjuros disponibles para bardo.

1. Cantidad de conjuros
Dirigite a \`conjuros\`. Allí verás cuántos trucos y conjuros puedes conocer.

2. Elegilos
En \`conjuros/disponibles\` puedes seleccionar cualquier truco y conjuro de nivel 1 de la lista de bardo (según la cantidad disponible).

3. Conjuros conocidos
Todos los conjuros seleccionados cuentan como conocidos. No necesitas prepararlos diariamente.
\`\`\`


# Clérigo 

\`\`\`
Fase 2:
> Características :

1. Características recomendadas: Sabiduría como atributo alto; Constitución como atributo medio. Fuerza o Destreza dependen del estilo de juego.

2. Idea de reparto:
 - SAB: 15 (Alto)
 - CON: 14 (Medio)
 - FUE: 14 (Medio)
 - DES: 10 (Medio)
 - CAR: 10 (Bajo)
 - INT: 8 (Bajo)

Fase 3:
> Equipo inicial:
Por clase obtienes un equipo inicial de elección entre A o B. Elige uno de los siguientes objetos de esta lista:

1. Elegí tu Equipo Inicial:
selecciona entre a o b por línea

- A elegir entre: (a) una maza o (b) un martillo de guerra (si tienes competencia).
- A elegir entre: (a) armadura de escamas, (b) armadura de cuero o (c) cota de malla (si tienes competencia).
- A elegir entre: (a) una ballesta ligera y 20 virotes o (b) cualquier arma sencilla.
- A elegir entre: (a) un paquete de sacerdote o (b) un paquete de explorador.
- Un escudo y un símbolo sagrado.

2. Añadilas desde \`equipo/añadir\`

3. Si elegís objetos con munición, editá manualmente la cantidad correspondiente.

Fase 4:
> Conjuros
El clérigo es una clase conjuradora lo que te da acceso a conjuros de la lista de conjuros disponibles para clérigo.

1. Cantidad de conjuros
Dirigite a \`conjuros\`. Allí aparecerá la cantidad de conjuros preparados y trucos que puedes seleccionar.

2. Elegilos
En \`conjuros/disponibles\` puedes elegir cualquier truco y conjuro de nivel 1 de la lista de clérigo.

3. Preparación
Los conjuros seleccionados deben marcarse como preparados para poder utilizarlos durante las sesiones.
\`\`\`


# Hechicero

\`\`\`
Fase 2:
> Características :

1. Características recomendadas: Carisma como atributo alto; Constitución y Destreza como atributos medios.

2. Idea de reparto:
 - CAR: 15 (Alto)
 - CON: 14 (Medio)
 - DES: 14 (Medio)
 - SAB: 12 (Medio)
 - INT: 10 (Bajo)
 - FUE: 8 (Bajo)

Fase 3:
> Equipo inicial:
Por clase obtienes un equipo inicial de elección entre A o B. Elige uno de los siguientes objetos de esta lista:

1. Elegí tu Equipo Inicial:
selecciona entre a o b por línea

- A elegir entre: (a) una ballesta ligera y 20 virotes o (b) cualquier arma sencilla.
- A elegir entre: (a) una bolsa de componentes o (b) un foco arcano.
- A elegir entre: (a) un paquete de explorador o (b) un paquete de aventurero.
- Dos dagas.

2. Añadilas desde \`equipo/añadir\`

3. Si elegís objetos con munición, editá manualmente la cantidad correspondiente.

Fase 4:
> Conjuros
El hechicero es una clase conjuradora lo que te da acceso a conjuros de la lista de conjuros disponibles para hechicero.

1. Cantidad de conjuros
Dirigite a \`conjuros\` y revisá la cantidad de trucos y conjuros conocidos que puedes seleccionar.

2. Elegilos
En \`conjuros/disponibles\` puedes elegir cualquier truco y conjuro de nivel 1 de la lista de hechicero (según la cantidad permitida).

3. Conjuros conocidos
Todos los conjuros seleccionados cuentan como conocidos. No necesitan preparación diaria.
\`\`\`


Exploradores
\`\`\`
Fase 2:
> Características :

1. Características recomendadas: Destreza como atributo alto; Sabiduría y Constitución como atributos medios.

2. Idea de reparto:
 - DES: 15 (Alto)
 - SAB: 14 (Medio)
 - CON: 14 (Medio)
 - FUE: 12 (Medio)
 - INT: 10 (Bajo)
 - CAR: 8 (Bajo)

Fase 3:
> Equipo inicial:
Por clase obtienes un equipo inicial de elección entre A o B. Elige uno de los siguientes objetos de esta lista:

1. Elegí tu Equipo Inicial:
selecciona entre a o b por línea

- A elegir entre: (a) armadura de escamas o (b) armadura de cuero.
- A elegir entre: (a) dos espadas cortas o (b) dos armas sencillas cuerpo a cuerpo.
- A elegir entre: (a) un paquete de explorador o (b) un paquete de aventurero.
- Un arco largo y una aljaba con flechas.

2. Añadilas desde \`equipo/añadir\`

3. Si elegís objetos con munición, editá manualmente la cantidad correspondiente.

Fase 4:
> Conjuros
El explorador es una clase conjuradora lo que te da acceso a conjuros de la lista de conjuros disponibles para explorador.

1. Cantidad de conjuros
Dirigite a \`conjuros\`. Allí podrás ver cuántos conjuros puedes conocer.

2. Elegilos
En \`conjuros/disponibles\` puedes elegir cualquier conjuro de nivel 1 de la lista de explorador (según la cantidad permitida).

3. Conjuros conocidos
Todos los conjuros seleccionados cuentan como conocidos. No necesitan preparación diaria.
\`\`\`



# ⚙️ Artífice

\`\`\`
Fase 2:
> Características :
1. Características recomendadas: Inteligencia como atributo alto; Constitución como atributo medio; Destreza como atributo medio.
2. Idea de reparto:
 - INT: 15 (Alto)
 - CON: 14 (Medio)
 - DES: 14 (Medio)
 - SAB: 12 (Medio)
 - CAR: 10 (Bajo)
 - FUE: 8 (Bajo)
Fase 3:
> Equipo inicial:
Por clase obtienes un equipo inicial de elección entre A o B. Elige uno de los siguientes objetos de esta lista:
1. Elegí tu Equipo Inicial:
selecciona entre a o b por línea
- A elegir entre: (a) una ballesta ligera y 20 virotes o (b) cualquier arma sencilla.
- A elegir entre: (a) armadura de cuero tachonado o (b) armadura de escamas.
- Herramientas de ladrón y un paquete de explorador.
- Un conjunto de herramientas de artesano con el que tengas competencia.
2. Añadilas desde \`equipo/añadir\`
3. Si elegís objetos con munición, editá manualmente la cantidad correspondiente.
Fase 4:
> Conjuros
El artífice es una clase conjuradora lo que te da acceso a conjuros de la lista de conjuros disponibles para artífice.
1. Cantidad de conjuros
Dirigite a \`conjuros\`. Allí aparecerá la cantidad de conjuros preparados que puedes utilizar.
2. Elegilos
En \`conjuros/disponibles\` puedes elegir cualquier conjuro de nivel 1 de la lista de artífice.
3. Preparación
Los conjuros seleccionados deben marcarse como preparados para poder utilizarlos durante las sesiones.
\`\`\`



⚔️ Guerrero

\`\`\`
Fase 2:
> Características :
1. Características recomendadas: Fuerza o Destreza como atributo alto; Constitución como atributo medio.
2. Idea de reparto (Guerrero de Fuerza):
 - FUE: 15 (Alto)
 - CON: 14 (Medio)
 - DES: 13 (Medio)
 - SAB: 12 (Medio)
 - CAR: 10 (Bajo)
 - INT: 8 (Bajo)
Fase 3:
> Equipo inicial:
Por clase obtienes un equipo inicial de elección entre A o B. Elige uno de los siguientes objetos de esta lista:
1. Elegí tu Equipo Inicial:
selecciona entre a o b por línea
- A elegir entre: (a) una armadura de cota de malla o (b) armadura de cuero, arco largo y 20 flechas.
- A elegir entre: (a) un arma marcial y un escudo o (b) dos armas marciales.
- A elegir entre: (a) una ballesta ligera y 20 virotes o (b) dos hachas de mano.
- A elegir entre: (a) un paquete de aventurero o (b) un paquete de explorador.
2. Añadilas desde \`equipo/añadir\`
3. Si elegís objetos con munición, editá manualmente la cantidad correspondiente.
\`\`\`



👊 Monje
\`\`\`
Fase 2:
> Características :
1. Características recomendadas: Destreza y Sabiduría como atributos altos; Constitución como atributo medio.
2. Idea de reparto:
 - DES: 15 (Alto)
 - SAB: 15 (Alto)
 - CON: 14 (Medio)
 - INT: 10 (Bajo)
 - CAR: 10 (Bajo)
 - FUE: 8 (Bajo)
Fase 3:
> Equipo inicial:
Por clase obtienes un equipo inicial de elección entre A o B. Elige uno de los siguientes objetos de esta lista:
1. Elegí tu Equipo Inicial:
selecciona entre a o b por línea
- A elegir entre: (a) una espada corta o (b) cualquier arma sencilla.
- A elegir entre: (a) un paquete de aventurero o (b) un paquete de explorador.
- 10 dardos.
2. Añadilas desde \`equipo/añadir\`
3. Si elegís los dardos, recordá editar la cantidad correspondiente en el inventario.
\`\`\``;
    }

    /**
     * Agrega fases desde texto_fases.txt
     */
    async addPhasesFromFile() {
        try {
            const response = await fetch('../extras/texto_fases.txt');
            const text = await response.text();
            this.parseAndAddPhases(text);
        } catch (e) {
            console.error('Error al cargar texto_fases.txt:', e);
        }
    }

    /**
     * Parsea y agrega fases desde el texto
     */
    parseAndAddPhases(text) {
        const classData = this.parsePhaseFile(text);
        let needsSave = false;

        Object.keys(classData).forEach(classId => {
            const cls = this.classes.find(c => c.id === classId);
            if (cls) {
                classData[classId].forEach(phase => {
                    // Verificar si ya existe una fase con el mismo título
                    const exists = cls.steps.find(s => s.title === phase.title);
                    if (!exists) {
                        cls.steps.push(phase);
                        needsSave = true;
                    }
                });
            }
        });

        if (needsSave) {
            this.saveClasses();
            this.renderClassList();
            if (this.currentClass) {
                this.renderPhasesList();
            }
        }
    }

    /**
     * Parsea el archivo de fases
     */
    parsePhaseFile(text) {
        const result = {};
        const classMap = {
            'Bárbaro': 'barbaro',
            'Mago': 'mago',
            'Paladin': 'paladin',
            'Druida': 'druida',
            'Bardo': 'bardo',
            'Clérigo': 'clerigo',
            'Hechicero': 'hechicero',
            'Exploradores': 'explorador',
            'Artífice': 'artifice',
            'Guerrero': 'guerrero',
            'Monje': 'monje'
        };

        const lines = text.split('\n');
        let currentClass = null;
        let currentPhase = null;
        let currentContent = [];

        lines.forEach(line => {
            // Detectar inicio de clase
            const classMatch = line.match(/^#\s*(.+?)\s*$/);
            if (classMatch) {
                if (currentClass && currentPhase && currentContent.length > 0) {
                    this.addPhaseToResult(result, currentClass, currentPhase, currentContent);
                }
                currentClass = classMap[classMatch[1].trim()] || classMatch[1].trim().toLowerCase();
                currentPhase = null;
                currentContent = [];
                return;
            }

            // Detectar inicio de fase
            const phaseMatch = line.match(/Fase\s+(\d+):/);
            if (phaseMatch && currentClass) {
                if (currentPhase && currentContent.length > 0) {
                    this.addPhaseToResult(result, currentClass, currentPhase, currentContent);
                }
                currentPhase = `Fase ${phaseMatch[1]}`;
                currentContent = [];
                return;
            }

            // Detectar título con >
            const titleMatch = line.match(/^>\s*(.+)$/);
            if (titleMatch && currentPhase) {
                currentContent.push({ type: 'title', content: titleMatch[1] });
                return;
            }

            // Agregar contenido
            if (currentPhase && line.trim()) {
                currentContent.push({ type: 'content', content: line });
            }
        });

        // Agregar última fase
        if (currentClass && currentPhase && currentContent.length > 0) {
            this.addPhaseToResult(result, currentClass, currentPhase, currentContent);
        }

        return result;
    }

    /**
     * Agrega fase al resultado
     */
    addPhaseToResult(result, classId, phaseName, content) {
        if (!result[classId]) {
            result[classId] = [];
        }

        let title = '';
        let instructions = '';

        content.forEach(item => {
            if (item.type === 'title') {
                title = item.content;
            } else {
                instructions += item.content + '\n';
            }
        });

        const phase = {
            title: title || phaseName,
            description: `Instrucciones para ${phaseName}`,
            instructions: instructions.trim(),
            image: '',
            video: '',
            links: [],
            notes: '',
            customContent: ''
        };

        result[classId].push(phase);
    }

    /**
     * Crea las clases por defecto
     */
    createDefaultClasses() {
        const phase1 = {
            title: 'Origen del Personaje',
            description: 'Elige el origen de tu personaje. Esto determinará tu motivación y trasfondo.',
            instructions: '> Selecciona un origen que resuene con tu personaje\n\nConsidera cómo este origen afecta tu personalidad\n\nPiensa en qué te motivó a convertirse en aventurero',
            image: 'https://via.placeholder.com/600x300/8b5cf6/ffffff?text=Origen+del+Personaje',
            video: '',
            links: [
                { title: 'Guía de Orígenes', url: '#' },
                { title: 'Trasfondos Comunes', url: '#' }
            ],
            notes: 'El origen afecta tus habilidades iniciales y ventajas de trasfondo.',
            customContent: ''
        };

        const classes = [
            { id: 'artifice', name: 'Artífice', description: 'Inventor y creador de artefactos mágicos', icon: '🛠️' },
            { id: 'barbaro', name: 'Bárbaro', description: 'Guerrero salvaje con fuerza bruta y furia desatada', icon: '🪓' },
            { id: 'bardo', name: 'Bardo', description: 'Maestro de la música y la magia de inspiración', icon: '🪕' },
            { id: 'brujo', name: 'Brujo', description: 'Usuario de magia pactada con entidades sobrenaturales', icon: '👁️' },
            { id: 'clerigo', name: 'Clérigo', description: 'Sacerdote guerrero con poder divino', icon: '🛡️' },
            { id: 'druida', name: 'Druida', description: 'Guardián de la naturaleza con poder de transformación', icon: '🐻' },
            { id: 'explorador', name: 'Explorador', description: 'Rastreador experto y maestro del combate a distancia', icon: '🏹' },
            { id: 'guerrero', name: 'Guerrero', description: 'Maestro del combate con todas las armas y armaduras', icon: '⚔️' },
            { id: 'hechicero', name: 'Hechicero', description: 'Usuario de magia innata y poder arcano', icon: '🔮' },
            { id: 'mago', name: 'Mago', description: 'Erudito de la magia arcana con versatilidad', icon: '🧙‍♂️' },
            { id: 'monje', name: 'Monje', description: 'Guerrero disciplinado con poderes ki', icon: '🥋' },
            { id: 'paladin', name: 'Paladín', description: 'Caballero sagrado con poder divino', icon: '🛡️✨' },
            { id: 'picaro', name: 'Pícaro', description: 'Maestro del sigilo, engaño y combate sigiloso', icon: '🗡️' },
            { id: 'pugilista', name: 'Pugilista', description: 'Guerrero de combate cuerpo a cuerpo sin armas', icon: '🥊' }
        ];

        classes.forEach(cls => {
            this.classes.push({
                ...cls,
                steps: [JSON.parse(JSON.stringify(phase1))]
            });
        });

        this.saveClasses();
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
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                this.classes = JSON.parse(saved);
            } catch (e) {
                console.error('Error al cargar clases:', e);
                this.classes = [];
            }
        }
    }

    /**
     * Guarda las clases en localStorage
     */
    saveClasses() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.classes));
    }

    /**
     * Renderiza la lista de clases en el sidebar
     */
    renderClassList() {
        const list = document.getElementById('classList');
        const noClassesMsg = document.getElementById('noClassesMessage');

        if (this.classes.length === 0) {
            list.innerHTML = '';
            noClassesMsg.classList.remove('hidden');
            return;
        }

        noClassesMsg.classList.add('hidden');
        list.innerHTML = '';

        this.classes.forEach((cls, index) => {
            const item = document.createElement('div');
            item.className = 'class-item';
            if (this.currentClass && this.currentClass.id === cls.id) {
                item.classList.add('active');
            }
            
            item.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${cls.icon || '⚔️'}</span>
                    <div>
                        <div class="font-semibold text-white">${cls.name}</div>
                        <div class="text-xs text-gray-400">${cls.steps.length} fases</div>
                    </div>
                </div>
                <div class="flex gap-1">
                    <button onclick="event.stopPropagation(); duplicateClass(${index})" class="btn btn-warning btn-sm" title="Duplicar">📋</button>
                    <button onclick="event.stopPropagation(); deleteClass(${index})" class="btn btn-danger btn-sm" title="Eliminar">🗑️</button>
                </div>
            `;
            
            item.onclick = () => this.selectClass(index);
            list.appendChild(item);
        });
    }

    /**
     * Selecciona una clase para editar
     */
    selectClass(index) {
        this.currentClass = this.classes[index];
        this.currentPhaseIndex = null;
        
        document.getElementById('classEditor').classList.remove('hidden');
        document.getElementById('emptyEditor').classList.add('hidden');
        document.getElementById('phasePreview').classList.add('hidden');
        
        document.getElementById('classTitle').textContent = `${this.currentClass.icon || '⚔️'} ${this.currentClass.name}`;
        document.getElementById('classDescription').textContent = this.currentClass.description;
        
        this.renderPhasesList();
        this.renderClassList(); // Actualizar estado activo
    }

    /**
     * Renderiza la lista de fases de la clase actual
     */
    renderPhasesList() {
        const list = document.getElementById('stepsList');
        const noPhasesMsg = document.getElementById('noPhasesMessage');

        if (!this.currentClass || this.currentClass.steps.length === 0) {
            list.innerHTML = '';
            noPhasesMsg.classList.remove('hidden');
            return;
        }

        noPhasesMsg.classList.add('hidden');
        list.innerHTML = '';

        this.currentClass.steps.forEach((phase, index) => {
            const item = document.createElement('div');
            item.className = 'phase-item';
            item.draggable = true;
            item.dataset.phaseIndex = index;
            
            item.innerHTML = `
                <div class="phase-number">${index + 1}</div>
                <div class="flex-1 cursor-pointer" onclick="previewPhase(${index})">
                    <div class="font-semibold text-white">${phase.title}</div>
                    <div class="text-xs text-gray-400 truncate">${phase.description}</div>
                </div>
                <div class="flex gap-1">
                    <button onclick="event.stopPropagation(); previewPhase(${index})" class="btn btn-info btn-sm" title="Preview">👁️</button>
                    <button onclick="event.stopPropagation(); editPhase(${index})" class="btn btn-secondary btn-sm" title="Editar">✏️</button>
                    <button onclick="event.stopPropagation(); duplicatePhase(${index})" class="btn btn-warning btn-sm" title="Duplicar">📋</button>
                    <button onclick="event.stopPropagation(); deletePhase(${index})" class="btn btn-danger btn-sm" title="Eliminar">🗑️</button>
                </div>
            `;
            
            list.appendChild(item);
        });

        this.setupDragAndDrop();
    }

    /**
     * Configura drag-and-drop para reordenar fases
     */
    setupDragAndDrop() {
        const list = document.getElementById('stepsList');
        if (!list) return;

        let draggedItem = null;

        list.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            e.target.classList.add('dragging');
        });

        list.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
            draggedItem = null;
        });

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(list, e.clientY);
            if (afterElement == null) {
                list.appendChild(draggedItem);
            } else {
                list.insertBefore(draggedItem, afterElement);
            }
        });

        list.addEventListener('drop', (e) => {
            e.preventDefault();
            this.reorderPhases();
        });
    }

    /**
     * Obtiene el elemento después del cursor para drag-and-drop
     */
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.phase-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    /**
     * Reordena las fases según el DOM
     */
    reorderPhases() {
        const list = document.getElementById('stepsList');
        const newOrder = [];
        
        list.querySelectorAll('.phase-item').forEach(item => {
            const oldIndex = parseInt(item.dataset.phaseIndex);
            newOrder.push(this.currentClass.steps[oldIndex]);
        });
        
        this.currentClass.steps = newOrder;
        this.saveClasses();
        this.renderPhasesList();
    }

    /**
     * Abre el modal para crear/editar clase
     */
    openClassModal(editIndex = null) {
        this.currentClassEditIndex = editIndex;
        
        if (editIndex !== null) {
            const cls = this.classes[editIndex];
            document.getElementById('classModalTitle').textContent = 'Editar Clase';
            document.getElementById('className').value = cls.name;
            document.getElementById('classDesc').value = cls.description;
            document.getElementById('classIcon').value = cls.icon || '';
        } else {
            document.getElementById('classModalTitle').textContent = 'Crear Nueva Clase';
            document.getElementById('className').value = '';
            document.getElementById('classDesc').value = '';
            document.getElementById('classIcon').value = '';
        }
        
        document.getElementById('classModal').classList.add('active');
    }

    /**
     * Cierra el modal de clase
     */
    closeClassModal() {
        document.getElementById('classModal').classList.remove('active');
    }

    /**
     * Guarda la clase (nueva o editada)
     */
    saveClass() {
        const name = document.getElementById('className').value;
        const description = document.getElementById('classDesc').value;
        const icon = document.getElementById('classIcon').value || '⚔️';
        
        if (!name.trim()) {
            alert('El nombre es requerido');
            return;
        }
        
        const classData = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            description,
            icon,
            steps: []
        };
        
        if (this.currentClassEditIndex !== null) {
            // Editar clase existente
            classData.steps = this.classes[this.currentClassEditIndex].steps;
            this.classes[this.currentClassEditIndex] = classData;
            
            if (this.currentClass && this.currentClass.id === this.classes[this.currentClassEditIndex].id) {
                this.currentClass = classData;
                document.getElementById('classTitle').textContent = `${classData.icon} ${classData.name}`;
                document.getElementById('classDescription').textContent = classData.description;
            }
        } else {
            // Crear nueva clase
            this.classes.push(classData);
        }
        
        this.saveClasses();
        this.closeClassModal();
        this.renderClassList();
        
        if (this.currentClassEditIndex === null) {
            this.selectClass(this.classes.length - 1);
        }
    }

    /**
     * Duplica una clase
     */
    duplicateClass(index) {
        const original = this.classes[index];
        const duplicate = JSON.parse(JSON.stringify(original));
        
        duplicate.id = original.id + '-copia';
        duplicate.name = original.name + ' (copia)';
        
        this.classes.push(duplicate);
        this.saveClasses();
        this.renderClassList();
        
        alert('Clase duplicada exitosamente');
    }

    /**
     * Elimina una clase
     */
    deleteClass(index) {
        if (!confirm('¿Estás seguro de eliminar esta clase y todas sus fases?')) {
            return;
        }
        
        this.classes.splice(index, 1);
        this.saveClasses();
        
        if (this.currentClass && index === this.classes.indexOf(this.currentClass)) {
            this.currentClass = null;
            document.getElementById('classEditor').classList.add('hidden');
            document.getElementById('emptyEditor').classList.remove('hidden');
        }
        
        this.renderClassList();
    }

    /**
     * Edita la clase actual
     */
    editCurrentClass() {
        if (!this.currentClass) return;
        const index = this.classes.findIndex(c => c.id === this.currentClass.id);
        this.openClassModal(index);
    }

    /**
     * Duplica la clase actual
     */
    duplicateCurrentClass() {
        if (!this.currentClass) return;
        const index = this.classes.findIndex(c => c.id === this.currentClass.id);
        this.duplicateClass(index);
    }

    /**
     * Elimina la clase actual
     */
    deleteCurrentClass() {
        if (!this.currentClass) return;
        const index = this.classes.findIndex(c => c.id === this.currentClass.id);
        this.deleteClass(index);
    }

    /**
     * Guarda la clase actual
     */
    saveCurrentClass() {
        if (!this.currentClass) return;
        this.saveClasses();
        alert('Cambios guardados exitosamente');
    }

    /**
     * Abre el modal para crear/editar fase
     */
    openPhaseModal(editIndex = null) {
        this.currentPhaseEditIndex = editIndex;
        
        if (editIndex !== null) {
            const phase = this.currentClass.steps[editIndex];
            document.getElementById('phaseModalTitle').textContent = 'Editar Fase';
            document.getElementById('phaseTitle').value = phase.title;
            document.getElementById('phaseDescription').value = phase.description;
            document.getElementById('phaseInstructions').value = phase.instructions || '';
            document.getElementById('phaseImage').value = phase.image || '';
            document.getElementById('phaseVideo').value = phase.video || '';
            document.getElementById('phaseLinks').value = phase.links ? phase.links.map(l => `${l.title}|${l.url}`).join('\n') : '';
            document.getElementById('phaseNotes').value = phase.notes || '';
            document.getElementById('phaseCustomContent').value = phase.customContent || '';
        } else {
            document.getElementById('phaseModalTitle').textContent = 'Crear Nueva Fase';
            document.getElementById('phaseTitle').value = '';
            document.getElementById('phaseDescription').value = '';
            document.getElementById('phaseInstructions').value = '';
            document.getElementById('phaseImage').value = '';
            document.getElementById('phaseVideo').value = '';
            document.getElementById('phaseLinks').value = '';
            document.getElementById('phaseNotes').value = '';
            document.getElementById('phaseCustomContent').value = '';
        }
        
        document.getElementById('phaseModal').classList.add('active');
    }

    /**
     * Cierra el modal de fase
     */
    closePhaseModal() {
        document.getElementById('phaseModal').classList.remove('active');
    }

    /**
     * Guarda la fase (nueva o editada)
     */
    savePhase() {
        const title = document.getElementById('phaseTitle').value;
        const description = document.getElementById('phaseDescription').value;
        const instructionsText = document.getElementById('phaseInstructions').value;
        const image = document.getElementById('phaseImage').value;
        const video = document.getElementById('phaseVideo').value;
        const linksText = document.getElementById('phaseLinks').value;
        const notes = document.getElementById('phaseNotes').value;
        const customContent = document.getElementById('phaseCustomContent').value;
        
        if (!title.trim()) {
            alert('El título es requerido');
            return;
        }
        
        // Las instrucciones ahora son texto plano con markdown, no array
        const instructions = instructionsText;
        const links = linksText.split('\n').filter(l => l.trim()).map(l => {
            const parts = l.split('|');
            return { title: parts[0], url: parts[1] || '#' };
        });
        
        const phaseData = {
            title,
            description,
            instructions,
            image,
            video,
            links,
            notes,
            customContent
        };
        
        if (this.currentPhaseEditIndex !== null) {
            // Editar fase existente
            this.currentClass.steps[this.currentPhaseEditIndex] = phaseData;
        } else {
            // Crear nueva fase
            this.currentClass.steps.push(phaseData);
        }
        
        this.saveClasses();
        this.closePhaseModal();
        this.renderPhasesList();
        this.renderClassList(); // Actualizar contador de fases
    }

    /**
     * Edita una fase
     */
    editPhase(index) {
        this.currentPhaseEditIndex = index;
        this.openPhaseModal(index);
    }

    /**
     * Duplica una fase
     */
    duplicatePhase(index) {
        const original = this.currentClass.steps[index];
        const duplicate = JSON.parse(JSON.stringify(original));
        
        duplicate.title = original.title + ' (copia)';
        
        this.currentClass.steps.splice(index + 1, 0, duplicate);
        this.saveClasses();
        this.renderPhasesList();
        this.renderClassList();
        
        alert('Fase duplicada exitosamente');
    }

    /**
     * Elimina una fase
     */
    deletePhase(index) {
        if (!confirm('¿Estás seguro de eliminar esta fase?')) {
            return;
        }
        
        this.currentClass.steps.splice(index, 1);
        this.saveClasses();
        this.renderPhasesList();
        this.renderClassList();
        
        if (this.currentPhaseIndex === index) {
            document.getElementById('phasePreview').classList.add('hidden');
        }
    }

    /**
     * Muestra el preview de una fase
     */
    previewPhase(index) {
        this.currentPhaseIndex = index;
        const phase = this.currentClass.steps[index];
        
        let html = `
            <div class="space-y-4">
                <h4 class="font-title text-2xl text-neon-violet">${phase.title}</h4>
                <p class="text-gray-300">${phase.description}</p>
        `;
        
        if (phase.image) {
            html += `
                <div class="bg-gray-800 rounded-lg overflow-hidden">
                    <img src="${phase.image}" alt="${phase.title}" class="w-full">
                </div>
            `;
        }
        
        if (phase.video) {
            html += `
                <div class="bg-gray-800 rounded-lg overflow-hidden">
                    <video src="${phase.video}" controls class="w-full"></video>
                </div>
            `;
        }
        
        if (phase.instructions) {
            html += `
                <div>
                    <h5 class="font-title text-lg text-neon-violet mb-2">Instrucciones:</h5>
                    <div class="text-gray-300">${this.parseMarkdown(phase.instructions)}</div>
                </div>
            `;
        }
        
        if (phase.links && phase.links.length > 0) {
            html += `
                <div>
                    <h5 class="font-title text-lg text-neon-violet mb-2">Enlaces Útiles:</h5>
                    <div class="flex flex-wrap gap-2">
                        ${phase.links.map(link => `<a href="${link.url}" target="_blank" class="btn btn-secondary btn-sm">${link.title} ↗</a>`).join('')}
                    </div>
                </div>
            `;
        }
        
        if (phase.notes) {
            html += `
                <div class="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                    <h5 class="text-yellow-500 mb-1">📝 Notas:</h5>
                    <p class="text-gray-300">${phase.notes}</p>
                </div>
            `;
        }
        
        if (phase.customContent) {
            html += `
                <div class="bg-gray-800 p-4 rounded">
                    <h5 class="font-title text-lg text-neon-violet mb-2">Contenido Personalizado:</h5>
                    <div class="text-gray-300">${phase.customContent}</div>
                </div>
            `;
        }
        
        html += '</div>';
        
        document.getElementById('previewContent').innerHTML = html;
        document.getElementById('phasePreview').classList.remove('hidden');
    }

    /**
     * Cierra el preview
     */
    closePreview() {
        document.getElementById('phasePreview').classList.add('hidden');
        this.currentPhaseIndex = null;
    }
}

// Inicializar el sistema
document.addEventListener('DOMContentLoaded', function() {
    window.adminGuide = new CharacterGuideAdmin();
});

// Funciones globales para botones
function openClassModal() {
    window.adminGuide.openClassModal();
}

function closeClassModal() {
    window.adminGuide.closeClassModal();
}

function saveClass() {
    window.adminGuide.saveClass();
}

function duplicateClass(index) {
    window.adminGuide.duplicateClass(index);
}

function deleteClass(index) {
    window.adminGuide.deleteClass(index);
}

function editCurrentClass() {
    window.adminGuide.editCurrentClass();
}

function duplicateCurrentClass() {
    window.adminGuide.duplicateCurrentClass();
}

function deleteCurrentClass() {
    window.adminGuide.deleteCurrentClass();
}

function saveCurrentClass() {
    window.adminGuide.saveCurrentClass();
}

function openPhaseModal() {
    window.adminGuide.openPhaseModal();
}

function closePhaseModal() {
    window.adminGuide.closePhaseModal();
}

function savePhase() {
    window.adminGuide.savePhase();
}

function editPhase(index) {
    window.adminGuide.editPhase(index);
}

function duplicatePhase(index) {
    window.adminGuide.duplicatePhase(index);
}

function deletePhase(index) {
    window.adminGuide.deletePhase(index);
}

function previewPhase(index) {
    window.adminGuide.previewPhase(index);
}

function closePreview() {
    window.adminGuide.closePreview();
}
