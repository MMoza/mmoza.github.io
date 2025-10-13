import { PrizeRange } from './PrizeRange.js'

/**
 * Defines the complete set of prize distribution rules based on player count ranges.
 */
export class PricePoolStructure {
    /**
     * @param {string} name - Descriptive name for the prize structure (e.g., 'Estándar 90 Players').
     * @param {PrizeRange[]} ranges - Array of PrizeRange objects covering all possible player counts.
     */
    constructor(name, ranges) {
        this.id = 'PPS-' + Date.now().toString() + Math.random().toString(36).substr(2, 4);
        this.name = name;
        this.ranges = ranges;
    }

    /**
     * Retrieves the correct PrizeRange based on the current number of players.
     * @param {number} playerCount - The total number of players registered.
     * @returns {PrizeRange | null} The matching PrizeRange object or null if none is found.
     */
    getRangeByPlayerCount(playerCount) {
        return this.ranges.find(range => 
            playerCount >= range.minPlayers && playerCount <= range.maxPlayers
        ) || null;
    }

    /**
     * Static factory method to create a PricePoolStructure instance from a raw JSON array/object.
     * As your JSON shows 'pricePoolStructure' as an array containing one object, 
     * this factory handles that wrapping.
     * @param {Object | Object[]} rawData - The raw object (or array containing the object) read from JSON.
     * @returns {PricePoolStructure | null} A validated PricePoolStructure instance.
     */
    static fromJSON(rawData) {
        // Manejar si el JSON es un array (como en tu ejemplo) y tomar el primer elemento
        const structureData = Array.isArray(rawData) ? rawData[0] : rawData;
        if (!structureData || !Array.isArray(structureData.ranges)) return null;

        const { name, ranges } = structureData;

        const mappedRanges = ranges
            .map(r => PrizeRange.fromJSON(r))
            .filter(r => r !== null);

        if (mappedRanges.length === 0) {
            console.warn("PricePoolStructure created with no valid prize ranges.");
        }

        return new PricePoolStructure(name || 'Custom Structure', mappedRanges);
    }
}