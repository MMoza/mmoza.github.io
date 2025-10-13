import { PaidPosition } from './PaidPosition.js';

/**
 * Defines the prize distribution structure for a specific range of total players.
 */
export class PrizeRange {
    /**
     * @param {number} minPlayers - Minimum number of players in this range (inclusive).
     * @param {number} maxPlayers - Maximum number of players in this range (inclusive).
     * @param {PaidPosition[]} positions - Array of PaidPosition objects.
     */
    constructor(minPlayers, maxPlayers, positions) {
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.positions = positions;
    }

    /**
     * Calculates the number of paid positions based on the length of the array.
     * @returns {number} The total count of paid positions.
     */
    get paidPositionsCount() {
        return this.positions.length;
    }

    /**
     * Calculates the sum of all percentages to ensure it equals 100%.
     * @returns {number} The total percentage (should ideally be 100).
     */
    getTotalPercentage() {
        return this.positions.reduce((sum, pos) => sum + pos.percentage, 0);
    }

    /**
     * Static factory method to create a PrizeRange instance from a raw JSON object.
     */
    static fromJSON(rawData) {
        if (!rawData) return null;

        const { minPlayers, maxPlayers, positions } = rawData; 

        const mappedPositions = Array.isArray(positions)
            ? positions.map(p => PaidPosition.fromJSON(p)).filter(p => p !== null)
            : [];

        const range = new PrizeRange(
            minPlayers,
            maxPlayers,
            mappedPositions
        );
        
        // Validación de Consistencia
        if (range.getTotalPercentage() !== 100) {
            console.warn(`PrizeRange for ${minPlayers}-${maxPlayers} players does not sum to 100%. Sum is ${range.getTotalPercentage()}.`);
            // Se crea de todas formas, pero con una advertencia, ya que a veces los desarrolladores usan números decimales.
        }

        return range;
    }
}