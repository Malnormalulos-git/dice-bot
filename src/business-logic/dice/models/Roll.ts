export class Roll {
    private readonly value: number;
    private readonly explodedRoll: Roll | null;

    constructor(value: number, explodedRoll: Roll | null = null) {
        this.value = value;
        this.explodedRoll = explodedRoll;
    }

    getValue(): number {
        return this.value + (this.explodedRoll ? this.explodedRoll.getValue() : 0);
    }

    toString(): string {
        return `${this.value}${this.explodedRoll ? ` (${this.explodedRoll.toString()})` : ''}`;
    }
}