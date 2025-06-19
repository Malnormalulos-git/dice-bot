import {config} from "../../../../../config";
import {DiceExpressionParser} from "../../../../business-logic/dice/parser/DiceExpressionParser";
import {describe, expect, test} from "@jest/globals";

const {MAX_DICE_COUNT, MAX_DICE_SIDES, MAX_EXPRESSION_LENGTH} = config;


describe('DiceExpressionParser', () => {
    // Mock dice roller that always returns predictable values
    // eslint-disable-next-line
    const mockDiceRoller = (sides: number) => 4;
    const parser = new DiceExpressionParser(mockDiceRoller);

    describe('Basic Expressions', () => {
        test('should parse simple number', () => {
            const result = parser.parse('42');
            expect(result.totalSum).toBe(42);
            expect(result.rollOutputs).toHaveLength(0);
        });

        test('should parse simple dice roll', () => {
            const result = parser.parse('2d6');
            expect(result.totalSum).toBe(8); // 4 + 4 from mock
            expect(result.rollOutputs).toHaveLength(1);
            expect(result.rollOutputs[0].rolls).toEqual([4, 4]);
        });

        test('should parse dice roll without number of dice', () => {
            const result = parser.parse('d20');
            expect(result.totalSum).toBe(4);
            expect(result.rollOutputs[0].dice).toBe('1d20');
        });
    });

    describe('Complex Expressions', () => {
        test('should handle addition', () => {
            const result = parser.parse('2d6+5');
            expect(result.totalSum).toBe(13); // (4 + 4) + 5
        });

        test('should handle subtraction', () => {
            const result = parser.parse('2d6-3');
            expect(result.totalSum).toBe(5); // (4 + 4) - 3
        });

        test('should handle multiplication', () => {
            const result = parser.parse('2d6*2');
            expect(result.totalSum).toBe(16); // (4 + 4) * 2
        });

        test('should handle division', () => {
            const result = parser.parse('2d6/2');
            expect(result.totalSum).toBe(4); // (4 + 4) / 2
        });

        test('should handle parentheses', () => {
            const result = parser.parse('(2d6+3)*2');
            expect(result.totalSum).toBe(22); // (8 + 3) * 2
        });

        test('should handle nested parentheses', () => {
            const result = parser.parse('(2d6+(3*2))');
            expect(result.totalSum).toBe(14); // (8 + 6)
        });

        test('should handle multiple dice rolls', () => {
            const result = parser.parse('2d6+1d4');
            expect(result.totalSum).toBe(12); // (4 + 4) + 4
            expect(result.rollOutputs).toHaveLength(2);
        });
    });

    describe('Error Handling', () => {
        test('should handle empty expression', () => {
            const t = () => {
                parser.parse('');
            };
            expect(t).toThrow(/Empty expression/);
        });

        test('should handle invalid operator placement', () => {
            const t = () => {
                parser.parse('2d6++3');
            };
            expect(t).toThrow(/Invalid operator placement/);
        });

        test.each(['2d', '2+'])('should handle invalid expression ending with operator or dice notation: %s', (expr) => {
            const t = () => {
                parser.parse(expr);
            };
            expect(t).toThrow(/Expression cannot end with an operator or 'd'/);
        });

        test('should handle invalid subexpressions', () => {
            const t = () => {
                parser.parse('1+(1+)');
            };
            expect(t).toThrow(/Subexpression starts or ends on operator/);
        });

        test('should handle skipped operators', () => {
            const t = () => {
                parser.parse('(2+2)(1+1)');
            };
            expect(t).toThrow(/At least one operator is skipped/);
        });

        test('should handle extra closing parentheses', () => {
            const t = () => {
                parser.parse('(2+2)+1)');
            };
            expect(t).toThrow(/Extra closing parentheses/);
        });

        test('should handle empty parentheses', () => {
            const t = () => {
                parser.parse('2d6+()');
            };
            expect(t).toThrow(/Empty parentheses/);
        });

        test('should handle extra opening parentheses', () => {
            const t = () => {
                parser.parse('(2d6');
            };
            expect(t).toThrow(/Extra opening parentheses/);
        });

        test('should handle division by zero', () => {
            const t = () => {
                parser.parse('2d6/0');
            };
            expect(t).toThrow(/Division by zero/);
        });

        test.each(['(1-2)d6', '2d0', '2d(1-3)'])('should handle negative number of dice or zero and lower sides', (expr) => {
            const t = () => {
                parser.parse(expr);
            };
            expect(t).toThrow(/Invalid number of dice or sides/);
        });
    });

    describe('Expression Limits', () => {
        test('should handle maximum expression length', () => {
            const t = () => {
                const longExpr = '2d6+'.repeat(MAX_EXPRESSION_LENGTH);
                parser.parse(longExpr);
            };
            expect(t).toThrow(/Expression is too long/);
        });

        test('should handle maximum dice count', () => {
            const t = () => {
                parser.parse(`${MAX_DICE_COUNT + 1}d6`);
            };
            expect(t).toThrow(/Too big number of dice/);
        });

        test('should handle maximum dice sides', () => {
            const t = () => {
                parser.parse(`2d${MAX_DICE_SIDES + 1}`);
            };
            expect(t).toThrow(/Too big number of dice/);
        });
    });

    describe('Tokenizer', () => {
        test('should handle multiple operators', () => {
            const result = parser.parse('2d6+3-1+5*5/25');
            expect(result.totalSum).toBe(11); // 8 + 3 - 1 + 1
        });
    });

    describe('Order of Operations', () => { // ("()" -> "XdY" -> "*", "/" -> "+", "-")
        test('should follow mathematical order of operations', () => {
            const result = parser.parse('2+3*2');
            expect(result.totalSum).toBe(8); // not 10
        });

        test('should handle multiple operations with parentheses', () => {
            const result = parser.parse('(2+3)*2');
            expect(result.totalSum).toBe(10); // not 8
        });

        test('should handle complex order of operations', () => {
            const result = parser.parse('2d6*2+3*2');
            expect(result.totalSum).toBe(22); // (8 * 2) + (3 * 2)
        });

        test('should handle complex order of operations dice', () => {
            const result = parser.parse('(2+1)d6*(2+3)/2');
            expect(result.totalSum).toBe(30); // 3 * 4 * 5 / 2
            expect(result.rollOutputs).toHaveLength(1);
        });
    });
});

describe('Dice Types', () => {
    // Mock dice roller that returns sequence: 2, 4, 6
    const mockDiceRoller = (() => {
        const sequence = [2, 4, 6];
        let index = 0;
        return () => {
            const value = sequence[index];
            index = (index + 1) % sequence.length;
            return value;
        };
    })();

    const parser = new DiceExpressionParser(mockDiceRoller);

    describe('Standard Dice (d)', () => {
        test('should sum all dice rolls', () => {
            const result = parser.parse('3d6');
            expect(result.totalSum).toBe(12); // 2 + 4 + 6
            expect(result.rollOutputs[0].rolls).toEqual([2, 4, 6]);
        });
    });

    describe('Highest Roll (h)', () => {
        test('should return highest roll value', () => {
            const result = parser.parse('3h6');
            expect(result.totalSum).toBe(6); // max of [2, 4, 6]
            expect(result.rollOutputs[0].rolls).toEqual([2, 4, 6]);
        });

        test('should work with single die', () => {
            const result = parser.parse('1h6');
            expect(result.totalSum).toBe(2);
            expect(result.rollOutputs[0].rolls).toEqual([2]);
        });
    });

    describe('Lowest Roll (l)', () => {
        test('should return lowest roll value', () => {
            const result = parser.parse('3l6');
            expect(result.totalSum).toBe(2); // min of [4, 6, 2]
            expect(result.rollOutputs[0].rolls).toEqual([4, 6, 2]);
        });

        test('should work with single die', () => {
            const result = parser.parse('1l6');
            expect(result.totalSum).toBe(4);
            expect(result.rollOutputs[0].rolls).toEqual([4]);
        });
    });

    describe('Average Roll (a)', () => {
        test('should return average of rolls', () => {
            const result = parser.parse('3a6');
            expect(result.totalSum).toBe(4); // (6 + 2 + 4) / 3
            expect(result.rollOutputs[0].rolls).toEqual([6, 2, 4]);
        });

        test('should work with single die', () => {
            const result = parser.parse('1a6');
            expect(result.totalSum).toBe(6);
            expect(result.rollOutputs[0].rolls).toEqual([6]);
        });
    });

    test('should handle multiple dice types in one expression', () => {
        const result = parser.parse('2d6+3h6+2l6-3a6/4');
        expect(result.rollOutputs).toHaveLength(4);
        expect(result.totalSum).toBe(13); // (2 + 4) + 6 + 2 - (2 + 4 + 6) / 4
    });
});