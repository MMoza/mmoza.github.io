export const BountyType = {
    REGULAR: 'REGULAR',
    PROGRESSIVE: 'PROGRESSIVE',
    MYSTERY: 'MYSTERY'
};

export const MysteryActivationMode = {
    IMMEDIATE: 'IMMEDIATE',
    ITM: 'ITM',
    FINAL_TABLE: 'FINAL_TABLE',
    PLAYER_COUNT: 'PLAYER_COUNT'
};


/**
 * Representa la estructura y las reglas de una recompensa (Bounty) en un torneo.
 */
export class Bounty {
    
    constructor(type, params = {}) {
        this.type = type;

        Object.assign(this, params);

        if (type === BountyType.PROGRESSIVE && this.entryValueCents) {
            this._validateAndSetRoundedValues(this.entryValueCents);
        }
        
        if (type === BountyType.MYSTERY && 
            this.activationMode === MysteryActivationMode.PLAYER_COUNT && 
            this.activationValue <= 0) 
        {
             throw new Error("El modo PLAYER_COUNT requiere que 'activationValue' sea mayor que 0.");
        }
    }

    // ==========================================================
    // MÉTODOS ESTÁTICOS DE CREACIÓN (FACTORÍA)
    // ==========================================================

    /** Crea un Bounty Regular (Fijo). */
    static createRegular() {
        return new Bounty(BountyType.REGULAR);
    }

    /** Crea un Bounty Progresivo (PKO). */
    static createProgressive(splitPercentage, bountyIncreasePercentage) {
        if (splitPercentage + bountyIncreasePercentage !== 100) {
            throw new Error("Para Bounty Progressive, los porcentajes deben sumar 100.");
        }
        
        return new Bounty(BountyType.PROGRESSIVE, {
            splitPercentage,
            bountyIncreasePercentage
        });
    }

    /** Crea un Mystery Bounty. */
    static createMystery(mysteryRewards, activationMode, activationValue = 0) {
        return new Bounty(BountyType.MYSTERY, {
            mysteryRewards: mysteryRewards || [],
            activationMode: activationMode || MysteryActivationMode.IMMEDIATE,
            activationValue: activationValue
        });
    }


    // ==========================================================
    // fromJSON con LÓGICA FACTORÍA
    // ==========================================================

    /**
     * Crea una instancia de Bounty a partir de un objeto JSON, delegando al método factoría correcto.
     * @param {object} json - El objeto JSON con los datos de la recompensa.
     * @returns {Bounty}
     */
    static fromJSON(json) {
        if (!json || !json.type) return null;

        const { type, ...rest } = json;

        switch (type) {
            case BountyType.REGULAR:
                return Bounty.createRegular();

            case BountyType.PROGRESSIVE:
                return Bounty.createProgressive(
                    rest.splitPercentage || 0,
                    rest.bountyIncreasePercentage || 0
                );

            case BountyType.MYSTERY:
                return Bounty.createMystery(
                    rest.mysteryRewards,
                    rest.activationMode,
                    rest.activationValue
                );
                
            default:
                console.error(`Tipo de Bounty desconocido: ${type}`);
                return null;
        }
    }
}