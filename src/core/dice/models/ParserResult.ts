import {DiceRolls} from "./DiceRolls";

export class ParserResult {
    totalSum: number;
    rollOutputs: DiceRolls[];

    constructor(totalSum: number = 0, rollOutputs: DiceRolls[] = []) {
        this.totalSum = totalSum;
        this.rollOutputs = rollOutputs;
    }
}