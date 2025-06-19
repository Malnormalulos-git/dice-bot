export class DiceRoll {
    dice: string;
    rolls: number[];
    diceResult: number;

    constructor(dice: string, rolls: number[], diceResult: number) {
        this.dice = dice;
        this.rolls = rolls;
        this.diceResult = diceResult;
    }

    toString(): string {
        return `${this.dice}: [${this.rolls.join(', ')}] = ${this.diceResult}`;
    }
}