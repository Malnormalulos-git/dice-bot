import mapEnum from "../../utils/mapEnum";
import {UserError} from "../../errors/UserError";

export enum FilterCompairerType {
    lessThan = '<',
    lessEqualThan = '<=',
    greaterThan = '>',
    greaterEqualThan = '>=',
    equal = '='
}

const comparerMap: Record<FilterCompairerType, (value: number, reference: number) => boolean> = {
    [FilterCompairerType.lessThan]: (value: number, reference: number) => value < reference,
    [FilterCompairerType.lessEqualThan]: (value: number, reference: number) => value <= reference,
    [FilterCompairerType.greaterThan]: (value: number, reference: number) => value > reference,
    [FilterCompairerType.greaterEqualThan]: (value: number, reference: number) => value >= reference,
    [FilterCompairerType.equal]: (value: number, reference: number) => value == reference
};

export enum FilterType {
    display = 'display',
    sum = 's',
    count = 'c'
}

const typeMap: Record<FilterType, (matchingResults: number[]) => number | number[]> = {
    [FilterType.display]: (matchingResults: number[]) => matchingResults,
    [FilterType.sum]: (matchingResults: number[]) => matchingResults.reduce((sum, value) => sum + value, 0),
    [FilterType.count]: (matchingResults: number[]) => matchingResults.length
};

export class ParserResultsFilter {
    referenceValue: number | null;
    filterCompairer: FilterCompairerType;
    filterType: FilterType;

    constructor(referenceValue: number | null, filterCompairer: FilterCompairerType, filterType: FilterType) {
        this.referenceValue = referenceValue;
        this.filterCompairer = filterCompairer;
        this.filterType = filterType;
    }

    /**
     * Creates a ParserResultsFilter from a filterExpression string
     */
    static fromExpression(filterExpression: string): ParserResultsFilter | null {
        if (!filterExpression) {
            return null;
        }

        const match = filterExpression.match(/^([=><]{1,2})?(\d+)?([cs])?$/);

        if (match) {
            try {
                const comparerStr = match[1];
                const referenceValue = parseInt(match[2]);
                const typeStr = match[3];

                const filterType: FilterType = mapEnum(FilterType, typeStr) || FilterType.display;

                const mappedComparer = mapEnum(FilterCompairerType, comparerStr);
                if (!mappedComparer && comparerStr?.length == 2) {
                    throw new UserError(`Invalid filter comparer: ${comparerStr}`);
                }
                const filterCompairer = mappedComparer || FilterCompairerType.greaterEqualThan;

                return new ParserResultsFilter(
                    isNaN(referenceValue)
                        ? null
                        : referenceValue
                    , filterCompairer, filterType);
            } catch (error) {
                if (error instanceof UserError)
                    throw error;
                else
                    throw new UserError(`Please check syntax rules for the filter ${filterExpression}`);
            }
        }

        throw new UserError(`Invalid filter expression: ${filterExpression}`);
    }

    /**
     * Checks whether a value satisfies the filter condition
     */
    matches(value: number): boolean {
        if (this.referenceValue === null)
            return true;
        return comparerMap[this.filterCompairer](value, this.referenceValue);
    }

    /**
     * Applies a filter to the results array
     */
    apply(results: number[]): number | number[] {
        const matchingResults = results.filter(result => this.matches(result));

        return typeMap[this.filterType](matchingResults);
    }
}