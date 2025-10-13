/**
 * Defines the financial and stack contribution for any type of entry (Buy-In, Re-Entry, Re-Buy, Add-On).
 */
export class Entry {
    /**
     * @typedef {'main' | 'reEntry' | 'reBuyIn' | 'addOn'} EntryType
     */

    /**
     * The primary constructor. It performs mandatory internal validation.
     * @param {number} costCents - The total price of this entry (in cents).
     * @param {number} stack - The chip stack received for this entry.
     * @param {number} prizePoolContributionCents - Amount directed to the main prize pool.
     * @param {number} rakeCents - Amount retained by the house (rake/fee).
     * @param {number} bountyContributionCents - Amount directed to the bounty pool (0 if not PKO).
     * @param {EntryType} [type='main'] - The type of entry action this represents.
     */
    constructor(
        costCents,
        stack,
        prizePoolContributionCents,
        rakeCents,
        bountyContributionCents = 0,
        type = 'main' //
    ) {
        const totalContribution = prizePoolContributionCents + rakeCents + bountyContributionCents;
        
        // Validation check to ensure financial integrity
        if (totalContribution !== costCents) {
            console.error(`Cost Mismatch: Total contribution (${totalContribution}) does not equal total cost (${costCents}).`);
            throw new Error("Entry cost mismatch: Contributions do not equal total cost.");
        }

        this.costCents = costCents;
        this.stack = stack;
        this.prizePoolContributionCents = prizePoolContributionCents;
        this.rakeCents = rakeCents;
        this.bountyContributionCents = bountyContributionCents;
        this.type = type;
    }

    /**
     * Static factory method to create an Entry instance from a raw JSON object.
     * This method ensures the data is mapped correctly and validated before instantiation.
     * @param {Object} rawData - The raw object read from JSON or localStorage.
     * @param {EntryType} [type='main'] - Explicitly sets the type if not reading from a structure where 'type' is included.
     * @returns {Entry | null} A validated Entry instance, or null if rawData is missing.
     */
    static fromJSON(rawData, type = 'main') {
        if (!rawData) return null;

        const { 
            costCents, 
            stack, 
            prizePoolContributionCents, 
            rakeCents, 
            bountyContributionCents 
        } = rawData;

        // Se llama al constructor principal para validación y creación, pasando el tipo
        return new Entry(
            costCents,
            stack,
            prizePoolContributionCents,
            rakeCents,
            bountyContributionCents,
            type
        );
    }
}