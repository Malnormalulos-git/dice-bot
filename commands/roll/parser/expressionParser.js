const { tokenize } = require('./tokenizer');
const { rollDice } = require('../utils/diceRoller');
const { MAX_DICE_COUNT, MAX_DICE_SIDES } = require('../../../config.js');

function parseExpression(expression) {
  try {
    let tokenizedExpression = tokenize(expression);
    if (tokenizedExpression.error) {
      return tokenizedExpression;
    }

    const diceRolls = [];

    function executeOperations(tokenExpr, operators) {
      for (let i = 0; i < tokenExpr.length; i++) {
        if (tokenExpr[i].type === 'operator' && operators[tokenExpr[i].value]) {

          // Check for division by zero
          if (tokenExpr[i].value === '/' && tokenExpr[i + 1].value === 0) {
            return { error: 'Division by zero' };
          }

          const result = operators[tokenExpr[i].value](tokenExpr[i - 1].value, tokenExpr[i + 1].value);

           // Check for NaN/Infinity results
          if (!Number.isFinite(result)) {
            return { error: 'Invalid calculation result' };
          }

          tokenExpr.splice(i - 1, 3, { type: 'number', value: result });
          i -= 1;
        }
      }
      return tokenExpr;
    }

    function parseExpr(tokenExpr) {
      // Error if subexpression starts or ends on operator
      if (tokenExpr[0].type === 'operator' || tokenExpr[tokenExpr.length - 1].type === 'operator') {
        return {error: `Subexpression in "${expression}" starts or ends on operator`};
      }

      let resExpr = parseParenthesDice(tokenExpr);
      if (resExpr.error) {
        return resExpr;
      }

      const operators = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b
      };

      resExpr = executeOperations(resExpr, {
        '*': operators['*'],
        '/': operators['/']
      });
      if (resExpr.error) {
        return resExpr;
      }

      resExpr = executeOperations(resExpr, {
        '+': operators['+'],
        '-': operators['-']
      });
      if (resExpr.error) {
        return resExpr;
      }

      // Error in case '...(X)(Y)...', when between parentheses operators are skipped
      if (resExpr.length !== 1) {
        return {error: `At least one operator is skipped in expression "${expression}"`};
      }
      return resExpr[0];
    }

    function parseParenthesDice(tokenExpr) {
      let parenthesStack = [];
  
      for (let i = 0; i < tokenExpr.length; i++) {
        const token = tokenExpr[i];
        
        if (token.type === 'parenthes') {
          if (token.value === '(') {
            parenthesStack.push(i);
          } 
          else if (token.value === ')') {
            // Error for extra closing parentheses
            if (parenthesStack.length === 0) {
              return {error: `Extra closing parentheses in expression "${expression}"`};
            }
            
            const startIndex = parenthesStack.pop();
            const subExpr = tokenExpr.slice(startIndex + 1, i);
            
            if (parenthesStack.length === 0) {
              // Error for empty parentheses
              if (subExpr.length === 0) {
                return {error: `Empty parentheses in expression "${expression}"`};
              }
              
              const result = parseExpr(subExpr);
              if (result.error) {
                return result;
              }

              tokenExpr.splice(startIndex, i - startIndex + 1, result);
              
              i = startIndex;
            }
          }
        }
      }
      
      // Error for extra opening parentheses
      if (parenthesStack.length > 0) {
        return {error: `Extra opening parentheses in expression "${expression}"`};
      }

      let i = 0;
      while (i < tokenExpr.length) {
        const token = tokenExpr[i];
        if (token.type === 'number' && i + 2 < tokenExpr.length) {
          if (tokenExpr[i + 1].type === 'dice' && tokenExpr[i + 2].type === 'number') {
            const numOfDices = token.value;
            const numOfSides = tokenExpr[i + 2].value;

            // Error if number of dices or sides incorrect
            if (numOfDices < 0 || numOfSides < 1) {
              return {error: `Invalid number of dices or sides: "${numOfDices}d${numOfSides}" in "${expression}"`};
            }
            else if (numOfDices > MAX_DICE_COUNT || numOfSides > MAX_DICE_SIDES) {
              return {error: `To big number of dices or sides: "${numOfDices}d${numOfSides}" in "${expression}"\n+ Maximum is ${MAX_DICE_COUNT}d${MAX_DICE_SIDES}`};
            }

            const rolls = [];
            let sum = 0;
            for (let j = 0; j < numOfDices; j++) {
              const roll = rollDice(numOfSides);
              rolls.push(roll);
              sum += roll;
            }

            diceRolls.push({
              dice: `${numOfDices}d${numOfSides}`,
              rolls: rolls,
              sum: sum
            });

            tokenExpr.splice(i, 3, {type: 'number', value: sum});
            continue; 
          }
        }
        i++;
      }

      return tokenExpr;
    }

    const result = parseExpr(tokenizedExpression);

    if (result.error){
      return result;
    }
    else {
      let totalLength = `# ${result.value}\nExpression: ${expression}\n`.length;
      const rollOutputs = [];
      
      for (const roll of diceRolls) {
        const rollOutput = `${roll.dice}: [${roll.rolls.join(', ')}] = ${roll.sum}\n`;
        rollOutputs.push({ text: rollOutput, sum: roll.sum, dice: roll.dice });
        totalLength += rollOutput.length;
      }

      return {
        totalSum: result.value,
        rollOutputs: rollOutputs,
        totalLength: totalLength
      }
    }
  } catch (error) {
    console.log(`"${expression}" causes an unhandled error: `);
    console.log(error);
    return {error: `Congrats! You occured unhandled error with "${expression}"!`};
  }
}

module.exports = { parseExpression };