class DiceRoll {
    constructor(dice, rolls, diceResult) {
        this.dice = dice;
        this.rolls = rolls;
        this.diceResult = diceResult;
    }

    toString() {
        return `${this.dice}: [${this.rolls.join(', ')}] = ${this.diceResult}\n`;
    }
}

module.exports = { DiceRoll };