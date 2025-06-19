import {config} from "../../../../config";
import {UserError} from "../../errors/UserError";
import {DiceRoll} from "../models/DiceRoll";
import {ParserResult} from "../models/ParserResult";
import {Token} from "../models/Token";


const {MAX_DICE_COUNT, MAX_DICE_SIDES, MAX_EXPRESSION_LENGTH} = config;

export class DiceExpressionParser {
    diceRoller: (numOfSides: number) => number;
    diceRolls: DiceRoll[];
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
        let current = '';

        for (let i = 0; i < expr.length; i++) {
            const char = expr[i];

            if ('0123456789'.includes(char)) {
                current += char;
            } else if ('dhla'.includes(char)) {
                if (tokens.length === 0 || tokens[tokens.length - 1].value !== ')') {
                    tokens.push(new Token('number', current ? parseInt(current) : 1));
                }
                tokens.push(new Token('dice', char));
                current = '';
            } else if ('+-*/'.includes(char)) {
                if (current) {
                    tokens.push(new Token('number', parseInt(current)));
                    current = '';
                }
                if (
                    tokens.length === 0 ||
                    tokens[tokens.length - 1].type === 'operator' ||
                    tokens[tokens.length - 1].type === 'dice'
                ) {
                    throw new UserError(`Invalid operator placement: "${char}"`, expr);
                }
                tokens.push(new Token('operator', char));
            } else if ('()'.includes(char)) {
                if (current) {
                    tokens.push(new Token('number', parseInt(current)));
                    current = '';
                }
                tokens.push(new Token('parentheses', char));
            } else {
                throw new UserError(`Invalid character: "${char}"`, expr);
            }
        }

        if (current) {
            tokens.push(new Token('number', parseInt(current)));
        } else if (tokens.length > 0 && '+-*/d'.includes(tokens[tokens.length - 1].value as string)) {
            throw new UserError(`Expression cannot end with an operator or 'd': "${tokens[tokens.length - 1].value}"`, expr);
        }

        return tokens;
    }

    /**
     * Parses the tokenized expression and returns the result
     */
    parseExpression(tokens: Token[]): Token {
        if (tokens[0].type === 'operator' || tokens[tokens.length - 1].type === 'operator') {
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
            if (result[i].type === 'parentheses') {
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
        const diceTypes: { [key: string]: (rolls: number[]) => number } = {
            d: (rolls) => rolls.reduce((sum, roll) => sum + roll, 0),
            h: (rolls) => Math.max(...rolls),
            l: (rolls) => Math.min(...rolls),
            a: (rolls) => rolls.reduce((sum, roll) => sum + roll, 0) / rolls.length
        };

        for (let i = 0; i < result.length; i++) {
            if (
                result[i].type === 'number' &&
                i + 2 < result.length &&
                result[i + 1].type === 'dice' &&
                result[i + 2].type === 'number'
            ) {
                const numOfDice = result[i].value as number;
                const dice = result[i + 1].value as string;
                const numOfSides = result[i + 2].value as number;

                if (numOfDice < 0 || numOfSides < 1) {
                    throw new UserError(`Invalid number of dice or sides: "${numOfDice + dice + numOfSides}"`,
                        this.originalExpression);
                }
                if (numOfDice > MAX_DICE_COUNT || numOfSides > MAX_DICE_SIDES) {
                    throw new UserError(
                        `Too big number of dice or sides: "${numOfDice + dice + numOfSides}". 
                        Maximum is ${MAX_DICE_COUNT}d${MAX_DICE_SIDES}`,
                        this.originalExpression
                    );
                }

                const rolls: number[] = [];
                for (let j = 0; j < numOfDice; j++) {
                    const roll = this.diceRoller(numOfSides);
                    rolls.push(roll);
                }

                const diceResult = diceTypes[dice](rolls);
                const diceRoll = new DiceRoll(`${numOfDice + dice + numOfSides}`, rolls, diceResult);
                this.diceRolls.push(diceRoll);
                result.splice(i, 3, new Token('number', diceRoll.diceResult));
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
            if (result[i].type === 'operator' && operators.includes(result[i].value as string)) {
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

                result.splice(i - 1, 3, new Token('number', res));
                i--;
            }
        }

        return result;
    }
}