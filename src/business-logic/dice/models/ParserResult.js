class ParserResult {
    /**
     * @param {number} totalSum
     * @param {DiceRoll[]} rollOutputs
     */
    constructor(totalSum = 0, rollOutputs = []) {
        this.totalSum = totalSum;
        this.rollOutputs = rollOutputs;
    }
}

module.exports = { ParserResult };