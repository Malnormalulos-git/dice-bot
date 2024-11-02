const { MAX_DICE_COUNT, MAX_DICE_SIDES, MAX_EXPRESSION_LENGTH } = require('../../../config.js');

class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

class DiceRoll {
  constructor(dice, rolls, sum) {
    this.dice = dice;
    this.rolls = rolls;
    this.sum = sum;
  }

  toString() {
    return `${this.dice}: [${this.rolls.join(', ')}] = ${this.sum}\n`;
  }
}

class ParserResult {
  constructor(totalSum = 0, rollOutputs = []) {
    this.totalSum = totalSum;
    this.rollOutputs = rollOutputs;
  }
}

class UserError extends Error {
  constructor(message, expression = null) {
    super(message);
    this.expression = expression;
    this.name = 'UserError';
  }

  toString() {
    return `${this.message}${this.expression ? ` in "${this.expression}"` : ''}`;
  }
}

class DiceExpressionParser {
  constructor(diceRoller) {
    this.diceRoller = diceRoller;
    this.diceRolls = [];
    this.originalExpression = '';
  }

  parse(expression) {
    try {
      this.originalExpression = expression;
      this.diceRolls = [];
      
      if (!expression) {
        throw new UserError('Empty expression');
      }
      if (expression.length > MAX_EXPRESSION_LENGTH) {
        throw new UserError( `Expression is too long. Maximum length is ${MAX_EXPRESSION_LENGTH}`, expression);
      }

      const tokens = this.tokenize(expression);
      
      const result = this.parseExpression(tokens);
      return new ParserResult(result.value, this.diceRolls);
    } catch (error) {
      if (error instanceof UserError) {
        return { error: error.toString() };
      }
      console.error(`Unhandled error while parsing "${expression}":`, error);
      return { error: `Congrats! You occurred unhandled error with your "${expression}"!` };
    }
  }

  tokenize(expr) {
    const tokens = [];
    let current = '';
    
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      
      if ('0123456789'.includes(char)) {
        current += char;
      } 
      else if (char === 'd') {
        if (tokens.length === 0 || tokens[tokens.length - 1].value !== ')') { 
          tokens.push(new Token('number', current ? parseInt(current) : 1));
        }
        tokens.push(new Token('dice', 'd'));
        current = '';
      } 
      else if ('+-*/'.includes(char)) {
        if (current) {
          tokens.push(new Token('number', parseInt(current)));
          current = '';
        }
        if (tokens.length === 0 || 
            tokens[tokens.length - 1].type === 'operator' || 
            tokens[tokens.length - 1].type === 'dice') {
          throw new UserError(`Invalid operator placement: "${char}"`, expr);
        }
        tokens.push(new Token('operator', char));
      } 
      else if ('()'.includes(char)) {
        if (current) {
          tokens.push(new Token('number', parseInt(current)));
          current = '';
        }
        tokens.push(new Token('parenthes', char));
      } 
      else {
        throw new UserError(`Invalid character: "${char}" in expression "${expr}"`, expr);
      }
    }
    
    if (current) {
      tokens.push(new Token('number', parseInt(current)));
    } 
    else if (tokens.length > 0 && '+-*/d'.includes(tokens[tokens.length - 1].value)) {
      throw new UserError(`Expression cannot end with an operator or 'd': "${tokens[tokens.length - 1].value}"`, expr);
    }

    return tokens;
  }

  parseExpression(tokens) {
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

  handleParentheses(tokens) {
    const stack = [];
    const result = [...tokens];

    for (let i = 0; i < result.length; i++) {
      if (result[i].type === 'parenthes') {
        if (result[i].value === '(') {
          stack.push(i);
        } else {
          if (stack.length === 0) {
            throw new UserError('Extra closing parentheses', this.originalExpression);
          }
          
          const openIndex = stack.pop();
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

  handleDiceRolls(tokens) {
    const result = [...tokens];

    for (let i = 0; i < result.length; i++) {
      if (result[i].type === 'number' &&
          i + 2 < result.length &&
          result[i + 1].type === 'dice' &&
          result[i + 2].type === 'number'
      ) {
        const numOfDice = result[i].value;
        const numOfSides = result[i + 2].value;
        
        if (numOfDice < 0 || numOfSides < 1) {
          throw new UserError(`Invalid number of dices or sides: "${numOfDice}d${numOfSides}"`, this.originalExpression);
        }
        if (numOfDice > MAX_DICE_COUNT || numOfSides > MAX_DICE_SIDES) {
          throw new UserError(`Too big number of dices or sides: "${numOfDice}d${numOfSides}". Maximum is ${MAX_DICE_COUNT}d${MAX_DICE_SIDES}`, this.originalExpression);
        }
        
        const rolls = [];
        let sum = 0;
        for (let j = 0; j < numOfDice; j++) {
          const roll = this.diceRoller(numOfSides);
          rolls.push(roll);
          sum += roll;
        }
        
        const diceRoll = new DiceRoll(
          `${numOfDice}d${numOfSides}`,
          rolls,
          sum
        );

        this.diceRolls.push(diceRoll);
        result.splice(i, 3, new Token('number', diceRoll.sum));
      }
    }

    return result;
  }

  executeOperations(tokens, operators) {
    const result = [...tokens];

    const operations = {
      '+': (a, b) => a + b,
      '-': (a, b) => a - b,
      '*': (a, b) => a * b,
      '/': (a, b) => a / b,
    };

    for (let i = 0; i < result.length; i++) {
      if (result[i].type === 'operator' && operators.includes(result[i].value)) {
        const operator = result[i].value;
        const left = result[i - 1].value;
        const right = result[i + 1].value;
        
        if (operator === '/' && right === 0) {
          throw new UserError('Division by zero', this.originalExpression);
        }
    
        const res = operations[operator](left, right);
        
        if (!Number.isFinite(res)) {
          throw new UserError('Invalid calculation result', this.originalExpression);
        }
        
        result.splice(i - 1, 3, new Token('number', res));
        i --;
      }
    }
    
    return result;
  }
}

module.exports = {
  DiceExpressionParser,
  ParserResult,
  DiceRoll,
  UserError
};