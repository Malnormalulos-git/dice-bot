import {config} from "../../../../config";
import {UserError} from "../../errors/UserError";
import {DiceRolls} from "../models/DiceRolls";
import {ParserResult} from "../models/ParserResult";
import {Token, TokenType} from "../models/Token";
import {Roll} from "../models/Roll";


const {MAX_DICE_COUNT, MAX_DICE_SIDES, MAX_EXPRESSION_LENGTH} = config;

const DIGITS = '0123456789.';
const OPERATORS = '+-*/';
const DICE_TYPES = 'dhla';
const EXPLODE = 'e';
const PARENTHESES = '()';

class CurrentNumber {
    private value: string;
    private readonly expr: string;

    constructor(expr: string) {
        this.value = '';
        this.expr = expr;
    }

    appendCurrent(digit: string) {
        if (this.value.length === 0 && digit === '.') {
            throw new UserError('Number cannot start with decimal point.', this.expr);
        } else if (this.value.includes('.') && digit === '.') {
            throw new UserError('Too many decimal points', this.expr);
        }
        this.value += digit;
    }

    popCurrent() {
        if (this.value.endsWith('.')) {
            throw new UserError('Number cannot end with decimal point.', this.expr);
        }
        const result = parseFloat(this.value);
        this.value = '';
        return result;
    }

    isEmpty() {
        return this.value.length === 0;
    }
}

export class DiceExpressionParser {
    diceRoller: (numOfSides: number) => number;
    diceRolls: DiceRolls[];
    originalExpression: string;

    constructor(diceRoller: (numOfSides: number) => number) {
        this.diceRoller = diceRoller;
        this.diceRolls = [];
        this.originalExpression = '';
    }

    /**
     * Processes a dice roll expression and returns ParserResult or { error }
     */
    parse(expression: string): ParserResult {
        this.originalExpression = expression;
        this.diceRolls = [];

        if (!expression) {
            throw new UserError('Empty expression');
        }
        if (expression.length > MAX_EXPRESSION_LENGTH) {
            throw new UserError(`Expression is too long. Maximum length is ${MAX_EXPRESSION_LENGTH}`, expression);
        }

        const tokens = this.tokenize(expression);
        const result = this.parseExpression(tokens);
        return new ParserResult(result.value as number, this.diceRolls);
    }

    /**
     * Tokenizes the given expression into a list of tokens
     */
    tokenize(expr: string): Token[] {
        const tokens: Token[] = [];
        const current = new CurrentNumber(expr);

        for (let i = 0; i < expr.length; i++) {
            const char = expr[i];

            if (DIGITS.includes(char)) {
                current.appendCurrent(char);
            } else if (DICE_TYPES.includes(char)) {
                if (tokens.length === 0 || tokens[tokens.length - 1].value !== ')') {
                    tokens.push(new Token(TokenType.NUMBER, !current.isEmpty() ? current.popCurrent() : 1));
                }
                tokens.push(new Token(TokenType.DICE, char));
            } else if (OPERATORS.includes(char)) {
                if (!current.isEmpty()) {
                    tokens.push(new Token(TokenType.NUMBER, current.popCurrent()));
                }
                if (
                    tokens.length === 0 ||
                    tokens[tokens.length - 1].type === TokenType.OPERATOR ||
                    tokens[tokens.length - 1].type === TokenType.DICE
                ) {
                    throw new UserError(`Invalid operator placement: "${char}"`, expr);
                }
                tokens.push(new Token(TokenType.OPERATOR, char));
            } else if (PARENTHESES.includes(char)) {
                if (!current.isEmpty()) {
                    tokens.push(new Token(TokenType.NUMBER, current.popCurrent()));
                }
                tokens.push(new Token(TokenType.PARENTHESES, char));
            } else if (char === EXPLODE) {
                if (
                    !current.isEmpty() ||
                    tokens.length === 0 ||
                    tokens[tokens.length - 1].type !== TokenType.DICE
                ) {
                    throw new UserError(`Invalid explode operator placement`, expr);
                }
                tokens[tokens.length - 1].explode = true;
            }
            else {
                throw new UserError(`Invalid character: "${char}"`, expr);
            }
        }

        if (!current.isEmpty()) {
            tokens.push(new Token(TokenType.NUMBER, current.popCurrent()));
        } else if (tokens.length > 0 &&
            (OPERATORS + DICE_TYPES).includes(tokens[tokens.length - 1].value as string)) {
            throw new UserError(`Expression cannot end with an operator or dice: "${tokens[tokens.length - 1].value}"`, expr);
        }

        return tokens;
    }

    /**
     * Parses the tokenized expression and returns the result
     */
    parseExpression(tokens: Token[]): Token {
        if (tokens[0].type === TokenType.OPERATOR || tokens[tokens.length - 1].type === TokenType.OPERATOR) {
            throw new UserError('Subexpression starts or ends on operator', this.originalExpression);
        }

        let processedTokens = this.handleParentheses(tokens);
        processedTokens = this.handleDiceRolls(processedTokens);
        processedTokens = this.executeOperations(processedTokens, ['*', '/']);
        processedTokens = this.executeOperations(processedTokens, ['+', '-']);

        if (processedTokens.length > 1) {
            throw new UserError('At least one operator is skipped', this.originalExpression);
        }

        return processedTokens[0];
    }

    /**
     * Handles parentheses in the given tokens
     */
    handleParentheses(tokens: Token[]): Token[] {
        const stack: number[] = [];
        const result = [...tokens];

        for (let i = 0; i < result.length; i++) {
            if (result[i].type === TokenType.PARENTHESES) {
                if (result[i].value === '(') {
                    stack.push(i);
                } else {
                    if (stack.length === 0) {
                        throw new UserError('Extra closing parentheses', this.originalExpression);
                    }

                    const openIndex = stack.pop()!;
                    const subExpression = result.slice(openIndex + 1, i);

                    if (subExpression.length === 0) {
                        throw new UserError('Empty parentheses', this.originalExpression);
                    }

                    const subExprRes = this.parseExpression(subExpression);
                    result.splice(openIndex, i - openIndex + 1, subExprRes);
                    i = openIndex;
                }
            }
        }

        if (stack.length > 0) {
            throw new UserError('Extra opening parentheses', this.originalExpression);
        }

        return result;
    }

    /**
     * Handles dice rolls in the given tokens
     */
    handleDiceRolls(tokens: Token[]): Token[] {
        const result = [...tokens];
        const diceTypes: { [key: string]: (rolls: Roll[]) => number } = {
            d: (rolls) => rolls.reduce((sum, roll) => sum + roll.getValue(), 0),
            h: (rolls) => Math.max(...rolls.map((roll) => roll.getValue())),
            l: (rolls) => Math.min(...rolls.map((roll) => roll.getValue())),
            a: (rolls) => rolls.reduce((sum, roll) => sum + roll.getValue(), 0) / rolls.length
        };

        for (let i = 0; i < result.length; i++) {
            if (
                result[i].type === TokenType.NUMBER &&
                i + 2 < result.length &&
                result[i + 1].type === TokenType.DICE &&
                result[i + 2].type === TokenType.NUMBER
            ) {
                const numOfDice = Math.trunc(result[i].value as number);
                const dice = result[i + 1].value as string;
                const explode = result[i + 1].explode;
                const numOfSides = Math.trunc(result[i + 2].value as number);

                const diceExpression = `${numOfDice}${dice}${explode ? 'e' : ''}${numOfSides}`;

                if (numOfDice < 0 || numOfSides < 1) {
                    throw new UserError(`Invalid number of dice or sides: "${diceExpression}"`,
                        this.originalExpression);
                }
                if (numOfDice > MAX_DICE_COUNT || numOfSides > MAX_DICE_SIDES) {
                    throw new UserError(
                        `Too big number of dice or sides: "${diceExpression}". Maximum is ${MAX_DICE_COUNT}d${MAX_DICE_SIDES}`,
                        this.originalExpression
                    );
                }

                const self = this;

                function rollDice(): Roll {
                    const result = self.diceRoller(numOfSides);
                    if (explode && result === numOfSides && numOfSides !== 1) {
                        return new Roll(result, rollDice());
                    }
                    return new Roll(result, null);
                }

                const rolls: Roll[] = [];
                for (let j = 0; j < numOfDice; j++) {
                    rolls.push(rollDice());
                }

                const diceResult = diceTypes[dice](rolls);
                const diceRoll = new DiceRolls(diceExpression, rolls, diceResult);
                this.diceRolls.push(diceRoll);
                result.splice(i, 3, new Token(TokenType.NUMBER, diceRoll.diceResult));
            }
        }

        return result;
    }

    /**
     * Executes operations on the given tokens
     */
    executeOperations(tokens: Token[], operators: string[]): Token[] {
        const result = [...tokens];
        const operations: { [key: string]: (a: number, b: number) => number } = {
            '+': (a, b) => a + b,
            '-': (a, b) => a - b,
            '*': (a, b) => a * b,
            '/': (a, b) => a / b
        };

        for (let i = 0; i < result.length; i++) {
            if (result[i].type === TokenType.OPERATOR && operators.includes(result[i].value as string)) {
                const operator = result[i].value as string;
                const left = result[i - 1].value as number;
                const right = result[i + 1].value as number;

                if (operator === '/' && right === 0) {
                    throw new UserError('Division by zero', this.originalExpression);
                }

                const res = operations[operator](left, right);

                if (!Number.isFinite(res)) {
                    throw new UserError('Invalid calculation result', this.originalExpression);
                }

                result.splice(i - 1, 3, new Token(TokenType.NUMBER, res));
                i--;
            }
        }

        return result;
    }
}