import { TournamentTemplate } from '../models/TournamentTemplate.js';

const TEMPLATE_PATHS = [
    '../pokerTournamentManager/data/tournaments-templates/tournament_001.json',
    '../pokerTournamentManager/data/tournaments-templates/tournament_002.json',
    '../pokerTournamentManager/data/tournaments-templates/tournament_003.json',
    '../pokerTournamentManager/data/tournaments-templates/tournament_004.json'
];

/**
 * Servicio encargado de cargar, guardar y gestionar las plantillas de torneo (TournamentTemplate).
 */
export class TournamentTemplateService {
    
    constructor() {
        console.log()
        this.localStorageKey = 'pokerTournamentManager_templates';
    }

    /**
     * Simula la carga de plantillas por defecto desde archivos JSON.
     * En un entorno real, esto sería una serie de llamadas 'fetch'.
     * @returns {Promise<TournamentTemplate[]>} Una promesa que resuelve con un array de plantillas.
     */
    async loadDefaultTemplates() {
        console.log(`Cargando ${TEMPLATE_PATHS.length} plantillas por defecto...`);

        try {
            const fetchPromises = TEMPLATE_PATHS.map(path => 
                fetch(path)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error ${response.status} al cargar el archivo: ${path}`);
                        }
                        return response.json();
                    })
            );
            
            const rawJsonData = await Promise.all(fetchPromises); 
            
            const templates = rawJsonData
                .map(data => {
                    try {
                        return TournamentTemplate.fromJSON(data);
                    } catch (e) {
                        console.error("Error al convertir una plantilla JSON. Se ignorará. Detalles:", e, "Datos:", data);
                        return null;
                    }
                })
                .filter(template => template instanceof TournamentTemplate);
                
            console.log(`Plantillas cargadas y procesadas: ${templates.length}`);
            return templates;

        } catch (error) {
            console.error("Fallo crítico en la carga de plantillas por defecto:", error.message);
            return [];
        }
    }

    /**
     * Carga las plantillas guardadas por el usuario desde localStorage.
     * @returns {TournamentTemplate[]} Un array de plantillas de usuario.
     */
    loadUserTemplates() {
        console.log("Cargando plantillas de usuario desde localStorage...");
        const rawData = localStorage.getItem(this.localStorageKey);
        
        if (!rawData) {
            return [];
        }

        try {
            const rawTemplates = JSON.parse(rawData);
            
            // Mapear los datos crudos (con la misma estructura JSON) a instancias de clase
            const userTemplates = rawTemplates
                .map(data => TournamentTemplate.fromJSON(data))
                .filter(template => template !== null);

            return userTemplates;

        } catch (error) {
            console.error("Error al parsear plantillas de usuario desde localStorage:", error);
            return [];
        }
    }

    /**
     * Carga TODAS las plantillas (Por defecto + Usuario).
     * @returns {Promise<TournamentTemplate[]>} Array combinado de plantillas.
     */
    async loadAllTemplates() {
        const defaultTemplates = await this.loadDefaultTemplates();
        const userTemplates = this.loadUserTemplates();
        
        return [...defaultTemplates, ...userTemplates];
    }
    
    /**
     * Guarda un array de plantillas de usuario en localStorage.
     * @param {TournamentTemplate[]} templates - Array de instancias a guardar.
     */
    saveUserTemplates(templates) {
        try {
            const serializableData = JSON.stringify(templates);
            localStorage.setItem(this.localStorageKey, serializableData);
            console.log(`Guardadas ${templates.length} plantillas de usuario.`);
        } catch (error) {
            console.error("Error al guardar plantillas en localStorage:", error);
        }
    }
}