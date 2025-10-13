/**
 * Represents a single active blind level in the tournament structure.
 */
export class BlindLevel {
    /**
     * @typedef {number} ChipAmount - Amount of chips for blind or ante.
     */

    /**
     * @param {number} level - The sequential number of the blind level (e.g., 1, 2, 3...).
     * @param {ChipAmount} smallBlind - The Small Blind chip amount.
     * @param {ChipAmount} bigBlind - The Big Blind chip amount.
     * @param {ChipAmount} ante - The Ante chip amount.
     * @param {number} durationMinutes - The length of the level in minutes.
     */
    constructor(level, smallBlind, bigBlind, ante, durationMinutes) {
        this.type = 'level';
        this.level = level;
        this.smallBlind = smallBlind;
        this.bigBlind = bigBlind;
        this.ante = ante;
        this.durationMinutes = durationMinutes;
    }

    /**
     * Static factory method to create a BlindLevel instance from a raw JSON object.
     * @param {Object} rawData - The raw object read from JSON or localStorage.
     * @returns {BlindLevel | null} A BlindLevel instance, or null if invalid.
     */
    static fromJSON(rawData) {
        if (!rawData) return null;

        const { level, small_blind, big_blind, ante, durationMinutes } = rawData;

        // Nota: Asumimos que el JSON usa 'small_blind' (corregido de 'samll_blind')
        return new BlindLevel(
            level,
            small_blind,
            big_blind,
            ante,
            durationMinutes
        );
    }
}