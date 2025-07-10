import {config} from "../../../../config";

const {
    ROLL_KEYWORD_SYNONYMS,
    HIGHEST_ROLL_KEYWORD_SYNONYMS,
    LOWEST_ROLL_KEYWORD_SYNONYMS,
    AVERAGE_ROLL_KEYWORD_SYNONYMS,
    EXPLODE_EXPRESSION_KEYWORD_SYNONYMS,
    REPEAT_EXPRESSION_KEYWORD_SYNONYMS
} = config;

/**
 * Processes a raw dice roll expression/s and returns lowercased output with substituted synonyms and without ' '
 */
export function rawExpressionFormatter(rawExpression: string): string {
    let resultExpression = rawExpression.replaceAll(' ', '').toLowerCase();

    resultExpression = ROLL_KEYWORD_SYNONYMS.reduce(
        (str, synonym) => str.replaceAll(synonym, 'd'),
        resultExpression
    );

    resultExpression = HIGHEST_ROLL_KEYWORD_SYNONYMS.reduce(
        (str, synonym) => str.replaceAll(synonym, 'h'),
        resultExpression
    );

    resultExpression = LOWEST_ROLL_KEYWORD_SYNONYMS.reduce(
        (str, synonym) => str.replaceAll(synonym, 'l'),
        resultExpression
    );

    resultExpression = AVERAGE_ROLL_KEYWORD_SYNONYMS.reduce(
        (str, synonym) => str.replaceAll(synonym, 'a'),
        resultExpression
    );

    resultExpression = EXPLODE_EXPRESSION_KEYWORD_SYNONYMS.reduce(
        (str, synonym) => str.replaceAll(synonym, 'e'),
        resultExpression
    );

    resultExpression = REPEAT_EXPRESSION_KEYWORD_SYNONYMS.reduce(
        (str, synonym) => str.replaceAll(synonym, 'r'),
        resultExpression
    );

    return resultExpression;
}