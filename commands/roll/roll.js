const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

function tokenize(expr) {
  const tokens = [];
  let current = '';
  
  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];
    if ('0123456789'.includes(char)) {
      current += char;
    } 
    else if (char === 'd') {
      // to prevent auto substitution 'dY' to '1dY' for "...(...)d..." and "d..." cases
      if (tokens.length === 0 || tokens[tokens.length - 1].value !== ')') { 
        tokens.push({type: 'number', value: current ? parseInt(current) : 1});
      }
      tokens.push({type: 'dice', value: 'd'});
      current = '';
    } 
    else if ('+-*/'.includes(char)) {
      if (current) {
        tokens.push({type: 'number', value: parseInt(current)});
        current = '';
      }
      // Error if expression starts on operator; if 2 operators in a row; if operator comes after 'd'
      if (tokens.length === 0 || tokens[tokens.length - 1].type === 'operator' || tokens[tokens.length - 1].type === 'dice') {
        throw new Error(`Invalid operator placement: "${char}" in expression "${expr}"`);
      }
      tokens.push({type: 'operator', value: char});
    } 
    else if ('()'.includes(char)) {
      if (current) {
        tokens.push({type: 'number', value: parseInt(current)});
        current = '';
      }
      tokens.push({ type: 'parenthes', value: char });
    } 
    // Error if at least one inappropriate character in expression
    else {
      throw new Error(`Invalid character: "${char}" in expression "${expr}"`);
    }
  }
  
  if (current) {
    tokens.push({type: 'number', value: parseInt(current)});
  } 
  // Error if expression ends on operator or 'd'
  else if ('+-*/d'.includes(tokens[tokens.length - 1].value)) {
    throw new Error(`Expression cannot end with an operator or 'd': "${tokens[tokens.length - 1].value}" at the end of "${expr}"`);
  }

  return tokens;
}

function parseExpression(expression) {
  try {
    let tokenizedExpression = tokenize(expression);
    const diceRolls = [];

    function executeOperations(tokenExpr, operators) {
      for (let i = 0; i < tokenExpr.length; i++) {
        if (tokenExpr[i].type === 'operator' && operators[tokenExpr[i].value]) {
          const result = operators[tokenExpr[i].value](tokenExpr[i - 1].value, tokenExpr[i + 1].value);
          tokenExpr.splice(i - 1, 3, { type: 'number', value: result });
          i -= 1;
        }
      }
      return tokenExpr;
    }

    function parseExpr(tokenExpr) {
      // Error if subexpression starts or ends on operator
      if (tokenExpr[0].type === 'operator' || tokenExpr[tokenExpr.length - 1].type === 'operator') {
        throw new Error(`Subexpression in "${expression}" starts or ends on operator`);
      }
      let resExpr = parseParenthesDice(tokenExpr);

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

      resExpr = executeOperations(resExpr, {
        '+': operators['+'],
        '-': operators['-']
      });

      // Error in case '...(X)(Y)...', when multiplication operators are omitted
      if (resExpr.length !== 1) {
        throw new Error(`At least one operator is omitted in expression "${expression}"`);
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
              throw new Error(`Extra closing parentheses in expression "${expression}"`);
            }
            
            const startIndex = parenthesStack.pop();
            const subExpr = tokenExpr.slice(startIndex + 1, i);
            
            if (parenthesStack.length === 0) {
              // Error for empty parentheses
              if (subExpr.length === 0) {
                throw new Error(`Empty parentheses in expression "${expression}"`);
              }
              
              const result = parseExpr(subExpr);
              tokenExpr.splice(startIndex, i - startIndex + 1, result);
              
              i = startIndex;
            }
          }
        }
      }
      
      // Error for extra opening parentheses
      if (parenthesStack.length > 0) {
        throw new Error(`Extra opening parentheses in expression "${expression}"`);
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
              throw new Error(`Invalid number of dices or sides: "${numOfDices}d${numOfSides}" in "${expression}"`);
            }
            // else if (numOfDices > 500 || numOfSides > 500) {
            //   throw new Error(`To big number of dices or sides: "${numOfDices}d${numOfSides}" in "${expression}"\n+ Maximum is 500d500`);
            // }

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
    
    let output = `# ${result.value}\n`;

    output += `Expression: ${expression}\n`;
    
    diceRolls.forEach(roll => {
      output += `${roll.dice}: [${roll.rolls.join(', ')}] = ${roll.sum}\n`;
    });
    
    return `\`\`\`Markdown\n${output.trim()}\`\`\``;
  } 
  catch (error) {
    return `\`\`\`diff\n- Error: ${error.message}\`\`\``;
  }
}

function rollDice(numOfSides){
	return Math.floor(Math.random() * numOfSides) + 1;
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll any dice/dices')
		.addStringOption(option => option
			.setName('expression')
			.setDescription('Dice expression (e.g. 2d6, d20)')
			.setRequired(true)
		),
	async execute(interaction) {
		const expression = interaction.options.getString('expression');
    const result = parseExpression((
			expression
				.toString()
				.replaceAll(' ', '') 
				.toLocaleLowerCase()
				.replaceAll('д', 'd')
		));
    await interaction.reply(result);
	},
};
