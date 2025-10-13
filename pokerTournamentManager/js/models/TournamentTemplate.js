// 1. Importa los modelos CORE de la estructura
import { Entry } from './Entry.js';
import { BlindStructure } from './BlindStructure.js';
import { PricePoolStructure } from './PricePoolStructure.js';
import { Bounty } from './Bounty.js';

/* import { BlindLevel } from './BlindLevel.js';
import { Break } from './Break.js';
import { Bounty } from './Bounty.js';
import { ReEntry } from './ReEntry.js';
import { ReBuyIn } from './ReBuyIn.js';
import { AddOn } from './AddOn.js'; */

/**
 * Represents a reusable tournament configuration template. 
 * This class holds all structures and rules defining a tournament type.
 */
export class TournamentTemplate {
    
    /**
     * @typedef {Object} TournamentParams
     * @property {number} id - Unique ID for the template.
     * @property {string} name - Name of the tournament.
     * @property {string} description - Description of the tournament.
     * @property {Entry} mainEntry - The standard entry object (cost, stack, distribution).
     * @property {BlindStructure} blindStructure - The sequence of blind levels and breaks.
     * @property {PricePoolStructure} pricePoolStructure - The structure for distributing the main prize pool.
     * @property {number} minPlayers - Minimum number of players.
     * @property {number} maxPlayers - Maximum number of players.
     * @property {number} tableSize - Standard table size.
     * @property {number | null} finalTableSize - Final table size (can be null).
     * @property {number | null} earlyBirdStack - Extra chips awarded for registering early (can be null).
     * @property {number | null} lateBuyInLimitLevel - The blind level number until which late registration is open (can be null).
     * @property {Bounty | null} bounty - Rules for bounties (if applicable, or null).
     * @property {Object | null} reEntry - Rules for re-entry (if applicable, or null).
     * @property {Object | null} reBuyIn - Rules for re-buy (if applicable, or null).
     * @property {Object | null} addOn - Rules for add-on (if applicable, or null).
     */

    /**
     * @param {TournamentParams} params 
     */
    constructor({
        id, name, description, mainEntry, blindStructure, pricePoolStructure,
        minPlayers, maxPlayers, tableSize, finalTableSize, 
        earlyBirdStack, lateBuyInLimitLevel, bounty, reEntry, reBuyIn, addOn
    }) {
        this.id = id;
        this.name = name;
        this.description = description;

        // --- Estructuras Core ---
        this.mainEntry = mainEntry; 
        this.blindStructure = blindStructure;
        this.pricePoolStructure = pricePoolStructure;

        // --- Reglas Generales (Los valores null son permitidos) ---
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.tableSize = tableSize;
        this.finalTableSize = finalTableSize; // Puede ser null
        this.lateBuyInLimitLevel = lateBuyInLimitLevel; // Puede ser null
        this.earlyBirdStack = earlyBirdStack || 0; // Se fuerza a 0 si es null/undefined para cálculos

        // --- Reglas Condicionales (Objetos completos o null) ---
        this.bounty = bounty;
        this.reEntry = reEntry;
        this.reBuyIn = reBuyIn;
        this.addOn = addOn;
    }

    /**
     * Static factory method to create a TournamentTemplate instance from raw JSON data.
     * * @param {Object} rawData - The raw JSON object read from a file or API.
     * @returns {TournamentTemplate | null} A fully mapped TournamentTemplate instance.
     */
    static fromJSON(rawData) {
        if (!rawData) return null;
        
        // 1. Mapear estructuras CORE
        const mainEntry = Entry.fromJSON(rawData.mainEntry);
        // Asumiendo que el JSON tiene 'blindLevels'
        const blindStructure = BlindStructure.fromJSON({ levels: rawData.blindLevels }); 
        const pricePoolStructure = PricePoolStructure.fromJSON(rawData.pricePoolStructure);
        
        // 2. Mapear reglas condicionales (usando sus respectivos factories, si existen)
        // Nota: Si los modelos Bounty, ReEntry, etc. tienen fromJSON, se usarían aquí.
        // Por ahora, usamos los datos crudos o null si no están presentes.
        const reEntry = rawData.reEntry ? rawData.reEntry : null;
        const reBuyIn = rawData.reBuyIn ? rawData.reBuyIn : null;
        const addOn = rawData.addOn ? rawData.addOn : null;
        const bounty = rawData.bounty ? rawData.bounty : null;
        
        // 3. Crear la instancia final
        return new TournamentTemplate({
            id: rawData.id,
            name: rawData.name,
            description: rawData.description || '',
            
            // Core Mapped Structures
            mainEntry,
            blindStructure,
            pricePoolStructure,
            
            // Simple Properties (Usando los nombres corregidos del JSON)
            minPlayers: rawData.minPlayers, 
            maxPlayers: rawData.maxPlayers, 
            tableSize: rawData.tableSize,
            // Los siguientes pueden ser null directamente desde el JSON
            finalTableSize: rawData.finalTableSize || null, 
            lateBuyInLimitLevel: rawData.lateBuyInLimitLevel || null, 
            earlyBirdStack: rawData.earlyBirdStack || null,
            
            // Conditional Rules
            reEntry, 
            reBuyIn, 
            addOn,
            bounty
        });
    }

    /**
     * Helper para obtener el stack inicial base o con el bonus de Early Bird.
     */
    getInitialStack(isEarlyBird = false) {
        const bonus = (isEarlyBird && this.earlyBirdStack) ? this.earlyBirdStack : 0;
        return this.mainEntry.stack + bonus;
    }

    /**
     * Calcula el stack inicial (incluyendo Early Bird si aplica) en trminos
     * de ciegas grandes (Big Blinds) del Nivel 1.
     * * @param {boolean} [isEarlyBird=false] - Indica si se debe incluir el bonus de Early Bird.
     * @returns {number | null} El nmero de ciegas grandes o null si no se encuentra la estructura de ciegas.
     */
    getInitialStackInBB(isEarlyBird = false) {
        if (!this.blindStructure || !this.blindStructure.levels || this.blindStructure.levels.length === 0) {
            console.warn("No se puede calcular el stack en BB: la estructura de ciegas no está definida.");
            return null;
        }

        const firstBlindLevel = this.blindStructure.levels.find(level => !level.break);
        
        if (!firstBlindLevel || !firstBlindLevel.bigBlind || firstBlindLevel.bigBlind === 0) {
            console.error("El Nivel 1 de ciegas no está correctamente definido o la Big Blind es cero.");
            return null;
        }

        const initialStack = this.getInitialStack(isEarlyBird);
        const bigBlindValue = firstBlindLevel.bigBlind;

        return initialStack / bigBlindValue;
    }

    getTableSize() {
        return this.tableSize;
    }
}