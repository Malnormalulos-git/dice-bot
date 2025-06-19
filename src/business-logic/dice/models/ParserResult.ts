import {DiceRoll} from "./DiceRoll";

export class ParserResult {
    totalSum: number;
    rollOutputs: DiceRoll[];

    constructor(totalSum: number = 0, rollOutputs: DiceRoll[] = []) {
        this.totalSum = totalSum;
        this.rollOutputs = rollOutputs;
    }
}