import { BlindLevel } from './BlindLevel.js'
import { Break } from './Break.js'

/**
 * Represents the complete sequence of blind levels and breaks for a tournament.
 */
export class BlindStructure {
    /**
     * @param {(BlindLevel | Break)[]} levels - Array of BlindLevel and Break objects defining the sequence of play.
     */
    constructor(levels) {
        this.id = 'BS-' + Date.now().toString() + Math.random().toString(36).substr(2, 4);
        this.levels = levels;
    }

    /**
     * Static factory method to create a BlindStructure instance from a raw JSON object.
     * This handles the complex mapping of mixed types (BlindLevel or Break) within the 'levels' array.
     * @param {Object} rawData - The raw object read from JSON or localStorage.
     * @returns {BlindStructure | null} A validated BlindStructure instance.
     */
    static fromJSON(rawData) {
        if (!rawData || !Array.isArray(rawData.levels)) {
            if (Array.isArray(rawData)) {
                rawData = { levels: rawData };
            } else {
                 return null;
            }
        }

        const mappedLevels = rawData.levels.map(rawItem => {
            if (rawItem.type === 'break') {
                return Break.fromJSON(rawItem);
            } else if (rawItem.type === 'level') {
                return BlindLevel.fromJSON(rawItem);
            }

            if (rawItem.level) {
                 return BlindLevel.fromJSON(rawItem);
            } else if (rawItem.break) {
                 return Break.fromJSON(rawItem);
            }
            return null;
        }).filter(item => item !== null);

        if (mappedLevels.length === 0) {
            console.warn("BlindStructure created with no valid levels.");
        }

        return new BlindStructure(mappedLevels);
    }

    /**
     * Calculates the total expected duration of the blind structure in minutes.
     * @returns {number} Total duration in minutes.
     */
    getTotalDuration() {
        return this.levels.reduce((total, item) => total + (item.durationMinutes || 0), 0);
    }
}