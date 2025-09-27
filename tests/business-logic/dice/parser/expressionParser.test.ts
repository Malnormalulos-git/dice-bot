import {config} from "../../../../config";
import {DiceExpressionParser} from "../../../../src/core/dice/parser/DiceExpressionParser";
import {describe, expect, test} from "@jest/globals";

const {MAX_DICE_COUNT, MAX_DICE_SIDES, MAX_EXPRESSION_LENGTH} = config;

/**
 * function to create sequential dice roll mock
 */
function createSequentialMock(sequence: number[]): (sides: number) => number {
    let index = 0;
    return () => {
        const value = sequence[index];
        index = (index + 1) % sequence.length;
        return value;
    };
}

/**
 * function to create predictable dice roll mock that always returns the same value
 */
function createConstantMock(value: number): (sides: number) => number {
    return () => value;
}


/**
 * function to create dice roll mock that returns max value for explosions
 */
function createExplodingMock(maxRolls: number, sides: number, resetAfter: number | null = null): (sides: number) => number {
    let callCount = 0;
    return (numSides: number) => {
        callCount++;
        if (callCount <= maxRolls) {
            return numSides;
        }
        if (resetAfter !== null && callCount >= resetAfter) {
            callCount = 0;
        }
        return 1;
    };
}

describe('DiceExpressionParser', () => {
    describe('Basic Expressions', () => {
        // Mock dice roller that always returns predictable values
        const mockDiceRoller = createConstantMock(4);
        const parser = new DiceExpressionParser(mockDiceRoller);

        test('should parse simple number', () => {
            const result = parser.parse('42');
            expect(result.totalSum).toBe(42);
            expect(result.rollOutputs).toHaveLength(0);
        });

        test('should parse simple dice roll', () => {
            const result = parser.parse('2d6');
            expect(result.totalSum).toBe(8); // 4 + 4 from mock
            expect(result.rollOutputs).toHaveLength(1);
            expect(result.rollOutputs[0].rolls.map(r => r.getValue())).toEqual([4, 4]);
        });

        test('should parse dice roll without number of dice', () => {
            const result = parser.parse('d20');
            expect(result.totalSum).toBe(4);
            expect(result.rollOutputs[0].diceExpression).toBe('1d20');
        });

        test('should handle zero dice', () => {
            const result = parser.parse('0d6');
            expect(result.totalSum).toBe(0);
            expect(result.rollOutputs).toHaveLength(1);
            expect(result.rollOutputs[0].rolls).toHaveLength(0);
        });
    });

    describe('Fractional Numbers', () => {
        const mockDiceRoller = createConstantMock(4);
        const parser = new DiceExpressionParser(mockDiceRoller);

        test('should parse fractional numbers', () => {
            const result = parser.parse('1.5');
            expect(result.totalSum).toBe(1.5);
            expect(result.rollOutputs).toHaveLength(0);
        });

        test('should trunc fractional part of numbers at roll expression', () => {
            const result = parser.parse('2.5d6.7');
            expect(result.totalSum).toBe(8);
            expect(result.rollOutputs[0].diceExpression).toBe('2d6');
        });

        test('should properly calculate fractional numbers', () => {
            const result = parser.parse('1.7*2.5');
            expect(result.totalSum).toBe(4.25);
            expect(result.rollOutputs).toHaveLength(0);
        });
    });

    describe('Complex Expressions', () => {
        const mockDiceRoller = createConstantMock(4);
        const parser = new DiceExpressionParser(mockDiceRoller);

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

        test('should have correct dice roll structure', () => {
            const result = parser.parse('2d6+1d4');

            expect(result.rollOutputs).toHaveLength(2);
            expect(result.rollOutputs[0].diceExpression).toBe('2d6');
            expect(result.rollOutputs[0].rolls).toHaveLength(2);
            expect(result.rollOutputs[1].diceExpression).toBe('1d4');
            expect(result.rollOutputs[1].rolls).toHaveLength(1);
        });
    });

    describe('Error Handling', () => {
        const mockDiceRoller = createConstantMock(4);
        const parser = new DiceExpressionParser(mockDiceRoller);

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
            expect(t).toThrow(/Expression cannot end with an operator or dice/);
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

        test.each(['(1-2)d6', '2d0', '2d(1-3)'])('should handle negative number of dice or zero and lower sides: %s', (expr) => {
            const t = () => {
                parser.parse(expr);
            };
            expect(t).toThrow(/Invalid number of dice or sides/);
        });

        test('should handle numbers that starts with decimal point', () => {
            const t = () => {
                parser.parse('.2d2');
            };
            expect(t).toThrow(/Number cannot start with decimal point/);
        });

        test('should handle numbers that includes many decimal points', () => {
            const t = () => {
                parser.parse('0.2.d2');
            };
            expect(t).toThrow(/Too many decimal points/);
        });

        test('should handle numbers that ends with decimal point', () => {
            const t = () => {
                parser.parse('2.d2');
            };
            expect(t).toThrow(/Number cannot end with decimal point/);
        });

        test('should handle invalid characters', () => {
            const t = () => {
                parser.parse('2d6@');
            };
            expect(t).toThrow(/Invalid character/);
        });

        test('should handle invalid explode placement', () => {
            const t = () => {
                parser.parse('e2d6');
            };
            expect(t).toThrow(/Invalid explode operator placement/);
        });

        test('should handle invalid explode placement at end', () => {
            const t = () => {
                parser.parse('2e');
            };
            expect(t).toThrow(/Invalid explode operator placement/);
        });

        test('should handle invalid explode placement after number', () => {
            const t = () => {
                parser.parse('2ed6');
            };
            expect(t).toThrow(/Invalid explode operator placement/);
        });
    });

    describe('Expression Limits', () => {
        const mockDiceRoller = createConstantMock(4);
        const parser = new DiceExpressionParser(mockDiceRoller);

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

        test('should handle maximum allowed dice and sides', () => {
            const result = parser.parse(`${MAX_DICE_COUNT}d${MAX_DICE_SIDES}`);
            expect(result.rollOutputs[0].rolls).toHaveLength(MAX_DICE_COUNT);
        });

        test('should handle near maximum expression length', () => {
            const maxExpr = '1d6+'.repeat(Math.floor(MAX_EXPRESSION_LENGTH / 4) - 1) + '1';
            expect(() => parser.parse(maxExpr)).not.toThrow();
        });
    });

    describe('Tokenizer', () => {
        const mockDiceRoller = createConstantMock(4);
        const parser = new DiceExpressionParser(mockDiceRoller);

        test('should handle multiple operators', () => {
            const result = parser.parse('2d6+3-1+5*5/25');
            expect(result.totalSum).toBe(11); // 8 + 3 - 1 + 1
        });
    });

    describe('Order of Operations', () => {
        const mockDiceRoller = createConstantMock(4);
        const parser = new DiceExpressionParser(mockDiceRoller);

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
    describe('Standard Dice (d)', () => {
        const mockDiceRoller = createSequentialMock([2, 4, 6]);
        const parser = new DiceExpressionParser(mockDiceRoller);

        test('should sum all dice rolls', () => {
            const result = parser.parse('3d6');
            expect(result.totalSum).toBe(12); // 2 + 4 + 6
            expect(result.rollOutputs[0].rolls.map(r => r.getValue())).toEqual([2, 4, 6]);
        });
    });

    describe('Highest Roll (h)', () => {
        const mockDiceRoller = createSequentialMock([2, 4, 6]);
        const parser = new DiceExpressionParser(mockDiceRoller);

        test('should return highest roll value', () => {
            const result = parser.parse('3h6');
            expect(result.totalSum).toBe(6); // max of [2, 4, 6]
            expect(result.rollOutputs[0].rolls.map(r => r.getValue())).toEqual([2, 4, 6]);
        });

        test('should work with single die', () => {
            const mockRoller = createConstantMock(2);
            const singleParser = new DiceExpressionParser(mockRoller);
            const result = singleParser.parse('1h6');
            expect(result.totalSum).toBe(2);
            expect(result.rollOutputs[0].rolls.map(r => r.getValue())).toEqual([2]);
        });

        test('should handle h1 dice', () => {
            const mockRoller = createConstantMock(1);
            const h1Parser = new DiceExpressionParser(mockRoller);
            const result = h1Parser.parse('3h1');
            expect(result.totalSum).toBe(1);
            expect(result.rollOutputs[0].rolls.map(r => r.getValue())).toEqual([1, 1, 1]);
        });
    });

    describe('Lowest Roll (l)', () => {
        const mockDiceRoller = createSequentialMock([4, 6, 2]);
        const parser = new DiceExpressionParser(mockDiceRoller);

        test('should return lowest roll value', () => {
            const result = parser.parse('3l6');
            expect(result.totalSum).toBe(2); // min of [4, 6, 2]
            expect(result.rollOutputs[0].rolls.map(r => r.getValue())).toEqual([4, 6, 2]);
        });

        test('should work with single die', () => {
            const mockRoller = createConstantMock(4);
            const singleParser = new DiceExpressionParser(mockRoller);
            const result = singleParser.parse('1l6');
            expect(result.totalSum).toBe(4);
            expect(result.rollOutputs[0].rolls.map(r => r.getValue())).toEqual([4]);
        });

        test('should handle l1 dice', () => {
            const mockRoller = createConstantMock(1);
            const l1Parser = new DiceExpressionParser(mockRoller);
            const result = l1Parser.parse('3l1');
            expect(result.totalSum).toBe(1);
            expect(result.rollOutputs[0].rolls.map(r => r.getValue())).toEqual([1, 1, 1]);
        });
    });

    describe('Average Roll (a)', () => {
        const mockDiceRoller = createSequentialMock([6, 2, 4]);
        const parser = new DiceExpressionParser(mockDiceRoller);

        test('should return average of rolls', () => {
            const result = parser.parse('3a6');
            expect(result.totalSum).toBe(4); // (6 + 2 + 4) / 3
            expect(result.rollOutputs[0].rolls.map(r => r.getValue())).toEqual([6, 2, 4]);
        });

        test('should work with single die', () => {
            const mockRoller = createConstantMock(6);
            const singleParser = new DiceExpressionParser(mockRoller);
            const result = singleParser.parse('1a6');
            expect(result.totalSum).toBe(6);
            expect(result.rollOutputs[0].rolls.map(r => r.getValue())).toEqual([6]);
        });

        test('should handle a1 dice', () => {
            const mockRoller = createConstantMock(1);
            const a1Parser = new DiceExpressionParser(mockRoller);
            const result = a1Parser.parse('3a1');
            expect(result.totalSum).toBe(1);
            expect(result.rollOutputs[0].rolls.map(r => r.getValue())).toEqual([1, 1, 1]);
        });

        test('should handle floating point precision', () => {
            const mockRoller = createSequentialMock([1, 2, 3]);
            const avgParser = new DiceExpressionParser(mockRoller);
            const result = avgParser.parse('3a6');
            expect(result.totalSum).toBe(2); // (1 + 2 + 3) / 3
            expect(Number.isFinite(result.totalSum)).toBe(true);
        });
    });

    describe('Multiple Dice Types', () => {
        const mockDiceRoller = createSequentialMock([2, 4, 6, 2, 4, 6, 2, 4, 6, 2, 4, 6]);
        const parser = new DiceExpressionParser(mockDiceRoller);

        test('should handle multiple dice types in one expression', () => {
            const result = parser.parse('2d6+3h6+2l6-3a6/4');
            expect(result.rollOutputs).toHaveLength(4);
            // 2d6 = 2+4 = 6
            // 3h6 = max(6,2,4) = 6
            // 2l6 = min(6,2) = 2
            // 3a6 = (4+6+2)/3 = 4
            // Total: 6 + 6 + 2 - 4/4 = 6 + 6 + 2 - 1 = 13
            expect(result.totalSum).toBe(13);
        });
    });
});

describe('Exploding Dice', () => {
    describe('Basic Exploding Dice', () => {
        test('should handle single explosion', () => {
            const mockRoller = createExplodingMock(1, 6);
            const parser = new DiceExpressionParser(mockRoller);
            const result = parser.parse('1de6');

            expect(result.totalSum).toBe(7); // 6 + 1
            expect(result.rollOutputs).toHaveLength(1);
            expect(result.rollOutputs[0].diceExpression).toBe('1de6');
            expect(result.rollOutputs[0].rolls).toHaveLength(1);
            expect(result.rollOutputs[0].rolls[0].getValue()).toBe(7);
        });

        test('should handle multiple explosions', () => {
            const mockRoller = createExplodingMock(3, 6);
            const parser = new DiceExpressionParser(mockRoller);
            const result = parser.parse('1de6');

            expect(result.totalSum).toBe(19); // 6 + 6 + 6 + 1
            expect(result.rollOutputs[0].rolls[0].getValue()).toBe(19);
        });

        test('should not explode when not max roll', () => {
            const mockRoller = createConstantMock(3);
            const parser = new DiceExpressionParser(mockRoller);
            const result = parser.parse('1de6');

            expect(result.totalSum).toBe(3);
            expect(result.rollOutputs[0].rolls[0].getValue()).toBe(3);
        });

        test('should not explode d1', () => {
            const mockRoller = createConstantMock(1);
            const parser = new DiceExpressionParser(mockRoller);
            const result = parser.parse('1de1');

            expect(result.totalSum).toBe(1);
            expect(result.rollOutputs[0].rolls[0].getValue()).toBe(1);
        });
    });

    describe('Multiple Exploding Dice', () => {
        test('should handle multiple dice with explosions', () => {
            const mockRoller = createExplodingMock(1, 6, 2);
            const parser = new DiceExpressionParser(mockRoller);
            const result = parser.parse('2de6');

            expect(result.totalSum).toBe(14); // (6+1) + (6+1)
            expect(result.rollOutputs[0].rolls).toHaveLength(2);
            expect(result.rollOutputs[0].rolls[0].getValue()).toBe(7);
            expect(result.rollOutputs[0].rolls[1].getValue()).toBe(7);
        });
    });

    describe('Exploding Dice with Different Types', () => {
        test('should handle exploding highest roll', () => {
            const mockRoller = createExplodingMock(1, 6);
            const parser = new DiceExpressionParser(mockRoller);
            const result = parser.parse('2he6');

            expect(result.totalSum).toBe(7); // max of [7, 7] = 7
            expect(result.rollOutputs[0].rolls).toHaveLength(2);
        });

        test('should handle exploding lowest roll', () => {
            const mockRoller = createExplodingMock(1, 6, 3);
            const parser = new DiceExpressionParser(mockRoller);
            const result = parser.parse('3le6');

            expect(result.totalSum).toBe(1); // min of [7, 1, 7] = 1
            expect(result.rollOutputs[0].rolls).toHaveLength(3);
        });

        test('should handle exploding average roll', () => {
            const mockRoller = createExplodingMock(1, 6, 2);
            const parser = new DiceExpressionParser(mockRoller);
            const result = parser.parse('2ae6');

            expect(result.totalSum).toBe(7); // (6+1 + 6+1) / 2 = 7
            expect(result.rollOutputs[0].rolls).toHaveLength(2);
        });
    });

    describe('Exploding Dice in Complex Expressions', () => {
        test('should handle exploding dice in arithmetic', () => {
            const mockRoller = createExplodingMock(1, 6);
            const parser = new DiceExpressionParser(mockRoller);
            const result = parser.parse('1de6+5');

            expect(result.totalSum).toBe(12); // (6+1) + 5
        });

        test('should handle multiple exploding dice in expression', () => {
            const mockRoller = createExplodingMock(1, 6, 2);
            const parser = new DiceExpressionParser(mockRoller);
            const result = parser.parse('1de6+1de6');

            expect(result.totalSum).toBe(14); // (6+1) + (6+1)
            expect(result.rollOutputs).toHaveLength(2);
        });
    });

    describe('Exploding Dice Edge Cases', () => {
        test('should handle exploding with different sided dice', () => {
            const mockRoller = createExplodingMock(1, 20);
            const parser = new DiceExpressionParser(mockRoller);
            const result = parser.parse('1de20');

            expect(result.totalSum).toBe(21); // 20 + 1
        });

        test('should handle exploding with d2', () => {
            const mockRoller = createExplodingMock(2, 2);
            const parser = new DiceExpressionParser(mockRoller);
            const result = parser.parse('1de2');

            expect(result.totalSum).toBe(5); // 2 + 2 + 1
        });
    });
});

describe('Roll toString Method', () => {
    test('should format simple roll correctly', () => {
        const mockRoller = createConstantMock(4);
        const parser = new DiceExpressionParser(mockRoller);
        const result = parser.parse('1d6');

        expect(result.rollOutputs[0].toString()).toBe('1d6: [4] = 4');
    });

    test('should format exploding roll correctly', () => {
        const mockRoller = createExplodingMock(1, 6);
        const parser = new DiceExpressionParser(mockRoller);
        const result = parser.parse('1de6');

        expect(result.rollOutputs[0].toString()).toBe('1de6: [6 (1)] = 7');
    });

    test('should format multiple exploding rolls correctly', () => {
        const mockRoller = createExplodingMock(2, 6);
        const parser = new DiceExpressionParser(mockRoller);
        const result = parser.parse('1de6');

        expect(result.rollOutputs[0].toString()).toBe('1de6: [6 (6 (1))] = 13');
    });
});