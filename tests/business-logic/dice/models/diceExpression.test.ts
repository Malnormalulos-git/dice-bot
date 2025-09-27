import {describe, expect, test} from "@jest/globals";
import {DiceExpression} from "../../../../src/core/dice/models/DiceExpression";
import {
    FilterCompairerType,
    FilterType,
    ParserResultsFilter
} from "../../../../src/core/dice/models/ParserResultsFilter";

describe('DiceExpression.fromRawExpression', () => {
    test('should parse dice expressions from raw expression', () => {
        const result = DiceExpression.fromRawExpression('r3:d20[>10s]', 25, null);
        expect(result.expressionToParser).toBe('d20');
        expect(result.originalExpression).toBe('r3:d20[>10s]');
    });

    describe('Repeat parameter', () => {
        test('should be parsed from expression', () => {
            const result = DiceExpression.fromRawExpression('r12:d20', 1, null);
            expect(result.repeat).toBe(12);
        });
        test('should be passed from above', () => {
            const result = DiceExpression.fromRawExpression('d20', 15, null);
            expect(result.repeat).toBe(15);
        });
        test('should combine inline repeat and from above', () => {
            const result = DiceExpression.fromRawExpression('r3:d20', 15, null);
            expect(result.repeat).toBe(45);
        });
    });

    describe('Filter parameter', () => {
        test('should be parsed from expression', () => {
            const result = DiceExpression.fromRawExpression('r3:d20[>10s]', 1, null).filter;
            expect(result?.referenceValue).toBe(10);
            expect(result?.filterCompairer).toBe(FilterCompairerType.greaterThan);
            expect(result?.filterType).toBe(FilterType.sum);
        });
        test('should be passed from above', () => {
            const filter = new ParserResultsFilter(10, FilterCompairerType.greaterThan, FilterType.sum);
            const result = DiceExpression.fromRawExpression('r3:d20', 1, filter).filter;
            expect(result).toBe(filter);
        });
        test('should prioritize inline filter', () => {
            const filter = new ParserResultsFilter(11, FilterCompairerType.equal, FilterType.count);
            const result = DiceExpression.fromRawExpression('r3:d20[>10s]', 1, filter).filter;
            expect(result?.referenceValue).toBe(10);
            expect(result?.filterCompairer).toBe(FilterCompairerType.greaterThan);
            expect(result?.filterType).toBe(FilterType.sum);
        });
    });
});