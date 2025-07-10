import {Roll} from "./Roll";

export class DiceRolls {
    diceExpression: string;
    rolls: Roll[];
    diceResult: number;

    constructor(dice: string, rolls: Roll[], diceResult: number) {
        this.diceExpression = dice;
        this.rolls = rolls;
        this.diceResult = diceResult;
    }

    toString(): string {
        return `${this.diceExpression}: [${this.rolls.join(', ')}] = ${this.diceResult}`;
    }
}