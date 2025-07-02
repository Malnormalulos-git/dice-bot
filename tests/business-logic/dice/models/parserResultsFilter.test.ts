import {describe, expect, test} from "@jest/globals";
import {
    FilterCompairerType,
    FilterType,
    ParserResultsFilter
} from "../../../../src/business-logic/dice/models/ParserResultsFilter";
import {UserError} from "../../../../src/business-logic/errors/UserError";

describe('ParserResultsFilter', () => {
    describe('Constructor', () => {
        test('should create filter with all parameters', () => {
            const filter = new ParserResultsFilter(10, FilterCompairerType.greaterThan, FilterType.sum);

            expect(filter.referenceValue).toBe(10);
            expect(filter.filterCompairer).toBe(FilterCompairerType.greaterThan);
            expect(filter.filterType).toBe(FilterType.sum);
        });

        test('should create filter with null reference value', () => {
            const filter = new ParserResultsFilter(null, FilterCompairerType.equal, FilterType.count);

            expect(filter.referenceValue).toBeNull();
            expect(filter.filterCompairer).toBe(FilterCompairerType.equal);
            expect(filter.filterType).toBe(FilterType.count);
        });
    });

    describe('fromExpression', () => {
        test('should return null for empty string', () => {
            const result = ParserResultsFilter.fromExpression('');
            expect(result).toBeNull();
        });

        test('should return null for null input', () => {
            const result = ParserResultsFilter.fromExpression(null as any);
            expect(result).toBeNull();
        });

        test('should parse simple number as display filter', () => {
            const filter = ParserResultsFilter.fromExpression('10');

            expect(filter?.referenceValue).toBe(10);
            expect(filter?.filterCompairer).toBe(FilterCompairerType.greaterEqualThan);
            expect(filter?.filterType).toBe(FilterType.display);
        });

        test('should parse greater than with sum', () => {
            const filter = ParserResultsFilter.fromExpression('>15s');

            expect(filter?.referenceValue).toBe(15);
            expect(filter?.filterCompairer).toBe(FilterCompairerType.greaterThan);
            expect(filter?.filterType).toBe(FilterType.sum);
        });

        test('should parse less than with count', () => {
            const filter = ParserResultsFilter.fromExpression('<5c');

            expect(filter?.referenceValue).toBe(5);
            expect(filter?.filterCompairer).toBe(FilterCompairerType.lessThan);
            expect(filter?.filterType).toBe(FilterType.count);
        });

        test('should parse greater or equal', () => {
            const filter = ParserResultsFilter.fromExpression('>=20');

            expect(filter?.referenceValue).toBe(20);
            expect(filter?.filterCompairer).toBe(FilterCompairerType.greaterEqualThan);
            expect(filter?.filterType).toBe(FilterType.display);
        });

        test('should parse less or equal', () => {
            const filter = ParserResultsFilter.fromExpression('<=8s');

            expect(filter?.referenceValue).toBe(8);
            expect(filter?.filterCompairer).toBe(FilterCompairerType.lessEqualThan);
            expect(filter?.filterType).toBe(FilterType.sum);
        });

        test('should parse equal', () => {
            const filter = ParserResultsFilter.fromExpression('=12c');

            expect(filter?.referenceValue).toBe(12);
            expect(filter?.filterCompairer).toBe(FilterCompairerType.equal);
            expect(filter?.filterType).toBe(FilterType.count);
        });

        test('should parse filter without value (comparer only)', () => {
            const filter = ParserResultsFilter.fromExpression('>s');

            expect(filter?.referenceValue).toBeNaN();
            expect(filter?.filterCompairer).toBe(FilterCompairerType.greaterThan);
            expect(filter?.filterType).toBe(FilterType.sum);
        });

        test('should parse filter without comparer (value and type only)', () => {
            const filter = ParserResultsFilter.fromExpression('25c');

            expect(filter?.referenceValue).toBe(25);
            expect(filter?.filterCompairer).toBe(FilterCompairerType.greaterEqualThan);
            expect(filter?.filterType).toBe(FilterType.count);
        });

        test('should throw error for invalid expression', () => {
            expect(() => {
                ParserResultsFilter.fromExpression('invalid');
            }).toThrow(UserError);
            expect(() => {
                ParserResultsFilter.fromExpression('invalid');
            }).toThrow('Invalid filter expression: invalid');
        });

        test('should throw error for invalid characters', () => {
            expect(() => {
                ParserResultsFilter.fromExpression('>10x');
            }).toThrow(UserError);
        });

        test('should throw error for invalid comparers', () => {
            expect(() => {
                ParserResultsFilter.fromExpression('>>10s');
            }).toThrow(UserError);
        });
    });

    describe('matches', () => {
        test('should always return true when referenceValue is null', () => {
            const filter = new ParserResultsFilter(null, FilterCompairerType.greaterThan, FilterType.sum);

            expect(filter.matches(5)).toBe(true);
            expect(filter.matches(0)).toBe(true);
            expect(filter.matches(-5)).toBe(true);
        });

        test('should handle less than comparison', () => {
            const filter = new ParserResultsFilter(10, FilterCompairerType.lessThan, FilterType.sum);

            expect(filter.matches(5)).toBe(true);
            expect(filter.matches(10)).toBe(false);
            expect(filter.matches(15)).toBe(false);
        });

        test('should handle less or equal comparison', () => {
            const filter = new ParserResultsFilter(10, FilterCompairerType.lessEqualThan, FilterType.sum);

            expect(filter.matches(5)).toBe(true);
            expect(filter.matches(10)).toBe(true);
            expect(filter.matches(15)).toBe(false);
        });

        test('should handle greater than comparison', () => {
            const filter = new ParserResultsFilter(10, FilterCompairerType.greaterThan, FilterType.sum);

            expect(filter.matches(5)).toBe(false);
            expect(filter.matches(10)).toBe(false);
            expect(filter.matches(15)).toBe(true);
        });

        test('should handle greater or equal comparison', () => {
            const filter = new ParserResultsFilter(10, FilterCompairerType.greaterEqualThan, FilterType.sum);

            expect(filter.matches(5)).toBe(false);
            expect(filter.matches(10)).toBe(true);
            expect(filter.matches(15)).toBe(true);
        });

        test('should handle equal comparison', () => {
            const filter = new ParserResultsFilter(10, FilterCompairerType.equal, FilterType.sum);

            expect(filter.matches(5)).toBe(false);
            expect(filter.matches(10)).toBe(true);
            expect(filter.matches(15)).toBe(false);
        });
    });

    describe('apply', () => {
        describe('FilterType.display', () => {
            test('should return filtered results as array', () => {
                const filter = new ParserResultsFilter(10, FilterCompairerType.greaterThan, FilterType.display);
                const results = [5, 12, 8, 15, 3];

                const filtered = filter.apply(results);

                expect(filtered).toEqual([12, 15]);
            });

            test('should return empty array when no matches', () => {
                const filter = new ParserResultsFilter(20, FilterCompairerType.greaterThan, FilterType.display);
                const results = [5, 12, 8, 15, 3];

                const filtered = filter.apply(results);

                expect(filtered).toEqual([]);
            });

            test('should return all results with null reference value', () => {
                const filter = new ParserResultsFilter(null, FilterCompairerType.greaterThan, FilterType.display);
                const results = [5, 12, 8, 15, 3];

                const filtered = filter.apply(results);

                expect(filtered).toEqual([5, 12, 8, 15, 3]);
            });
        });

        describe('FilterType.sum', () => {
            test('should return sum of filtered results', () => {
                const filter = new ParserResultsFilter(10, FilterCompairerType.greaterThan, FilterType.sum);
                const results = [5, 12, 8, 15, 3];

                const sum = filter.apply(results);

                expect(sum).toBe(27); // 12 + 15
            });

            test('should return 0 when no matches', () => {
                const filter = new ParserResultsFilter(20, FilterCompairerType.greaterThan, FilterType.sum);
                const results = [5, 12, 8, 15, 3];

                const sum = filter.apply(results);

                expect(sum).toBe(0);
            });

            test('should return sum of all results with null reference value', () => {
                const filter = new ParserResultsFilter(null, FilterCompairerType.greaterThan, FilterType.sum);
                const results = [5, 12, 8, 15, 3];

                const sum = filter.apply(results);

                expect(sum).toBe(43); // 5 + 12 + 8 + 15 + 3
            });
        });

        describe('FilterType.count', () => {
            test('should return count of filtered results', () => {
                const filter = new ParserResultsFilter(10, FilterCompairerType.greaterThan, FilterType.count);
                const results = [5, 12, 8, 15, 3];

                const count = filter.apply(results);

                expect(count).toBe(2); // 12 and 15
            });

            test('should return 0 when no matches', () => {
                const filter = new ParserResultsFilter(20, FilterCompairerType.greaterThan, FilterType.count);
                const results = [5, 12, 8, 15, 3];

                const count = filter.apply(results);

                expect(count).toBe(0);
            });

            test('should return total count with null reference value', () => {
                const filter = new ParserResultsFilter(null, FilterCompairerType.greaterThan, FilterType.count);
                const results = [5, 12, 8, 15, 3];

                const count = filter.apply(results);

                expect(count).toBe(5);
            });
        });

        test('should handle empty results array', () => {
            const filter = new ParserResultsFilter(10, FilterCompairerType.greaterThan, FilterType.sum);

            expect(filter.apply([])).toBe(0);
        });

        test('should handle single element array', () => {
            const filter = new ParserResultsFilter(10, FilterCompairerType.greaterThan, FilterType.sum);

            expect(filter.apply([15])).toBe(15);
            expect(filter.apply([5])).toBe(0);
        });
    });

    describe('Complex scenarios', () => {
        test('should work with decimal reference values', () => {
            const filter = new ParserResultsFilter(10.5, FilterCompairerType.greaterThan, FilterType.count);
            const results = [10, 10.2, 10.8, 11, 12];

            const count = filter.apply(results);

            expect(count).toBe(3); // 10.8, 11, 12
        });

        test('should work with negative numbers', () => {
            const filter = new ParserResultsFilter(-5, FilterCompairerType.greaterThan, FilterType.display);
            const results = [-10, -3, -5, 0, 2];

            const filtered = filter.apply(results);

            expect(filtered).toEqual([-3, 0, 2]);
        });

        test('should handle edge cases with equal comparison', () => {
            const filter = new ParserResultsFilter(0, FilterCompairerType.equal, FilterType.count);
            const results = [0, 0, 1, -1, 0];

            const count = filter.apply(results);

            expect(count).toBe(3);
        });
    });
});