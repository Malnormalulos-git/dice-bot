const { ROLL_KEYWORD_SYNONYMS, 
  HIGHEST_ROLL_KEYWORD_SYNONYMS, 
  LOWEST_ROLL_KEYWORD_SYNONYMS, 
  AVERAGE_ROLL_KEYWORD_SYNONYMS 
} = require('../../../../config');

function expressionFormatter(rawExpression) {
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

  return resultExpression;
}

module.exports = { expressionFormatter };