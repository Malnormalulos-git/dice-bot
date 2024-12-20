const { ROLL_KEYWORD_SYNONYMS, 
    HIGHEST_ROLL_KEYWORD_SYNONYMS, 
    LOWEST_ROLL_KEYWORD_SYNONYMS, 
    AVERAGE_ROLL_KEYWORD_SYNONYMS ,
    REPEAT_EXPRESSION_KEYWORD_SYNONYMS
} = require('../../../../config');

/**
 * Processes a raw dice roll expression/s and returns lowercased output with substituted synonyms and without ' '
 * @param {string} rawExpression Raw dice expression/s input
 * @returns {string} Lowercased string output with substituted synonyms and without ' '
 */
function rawExpressionFormatter(rawExpression) {
    let resultExpression = rawExpression
        .replaceAll(' ', '')
        .toLowerCase();

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

    resultExpression = REPEAT_EXPRESSION_KEYWORD_SYNONYMS.reduce(
        (str, synonym) => str.replaceAll(synonym, 'r'),
        resultExpression
    );

    return resultExpression;
}

module.exports = { rawExpressionFormatter };