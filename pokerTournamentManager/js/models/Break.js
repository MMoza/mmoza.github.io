/**
 * Represents a break period in the tournament structure.
 */
export class Break {
    /**
     * @param {number} durationMinutes - The length of the break in minutes.
     */
    constructor(durationMinutes) {
        this.type = 'break';
        this.durationMinutes = durationMinutes;
    }

    /**
     * Static factory method to create a Break instance from a raw JSON object.
     * @param {Object} rawData - The raw object read from JSON or localStorage.
     * @returns {Break | null} A Break instance, or null if invalid.
     */
    static fromJSON(rawData) {
        if (!rawData || rawData.break !== true) return null;

        const { durationMinutes } = rawData;

        return new Break(durationMinutes);
    }
}