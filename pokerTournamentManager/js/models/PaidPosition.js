/**
 * Represents the prize percentage for a single paid finishing position.
 */
export class PaidPosition {
    /**
     * @param {number} position - The final finishing position (e.g., 1 for 1st place).
     * @param {number} percentage - The percentage of the prize pool received (e.g., 35 for 35%).
     */
    constructor(position, percentage) {
        this.position = position;
        this.percentage = percentage;
    }

    /**
     * Static factory method to create a PaidPosition instance from a raw JSON object.
     */
    static fromJSON(rawData) {
        if (!rawData) return null;
        const { position, percentage } = rawData;
        
        if (typeof percentage !== 'number' || percentage < 0) {
            console.warn(`Invalid percentage value for position ${position}.`);
            return null;
        }

        return new PaidPosition(position, percentage);
    }
}