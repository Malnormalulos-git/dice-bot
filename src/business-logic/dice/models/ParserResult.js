class ParserResult {
    constructor(totalSum = 0, rollOutputs = []) {
        this.totalSum = totalSum;
        this.rollOutputs = rollOutputs;
    }
}

module.exports = { ParserResult };