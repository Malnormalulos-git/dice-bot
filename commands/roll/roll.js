const { SlashCommandBuilder } = require('discord.js');

function tokenize(expr) {
  const tokens = [];
  let current = '';
  
  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];
    if ('0123456789'.includes(char)) {
      current += char;
    } 
    else if (char === 'd') {
      if (tokens.length === 0 || tokens[tokens.length - 1].value !== ')') { // for "...(...)d..." or "d..." cases
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
      else if (i == 0){
        throw new Error(`Expressions can\`t start on operator: "${char}" at the start of "${expr}"`);
      }
      else if (tokens[i - 1].type === 'operator' || tokens[i - 1].type === 'dice') {
        throw new Error(`Two operators in a row: "${expr[i - 1] + expr[i]}" in "${expr}"`);
      }

      tokens.push({type: 'operator', value: char});
    } 
    else if ('()'.includes(char)) {
      if (current) {
        tokens.push({type: 'number', value: parseInt(current)});
        current = '';
      }
      tokens.push({type: 'parenthes', value: char});
    }
    else {
      throw new Error(`At least one inappropriate character: "${char}" in "${expr}"`);
    }
  }
  
  if (current) {
    tokens.push({type: 'number', value: parseInt(current)});
  }
  else if ('+-*/('.includes(tokens[tokens.length - 1].value)){
    throw new Error(`Expressions can\`t end on operator: "${tokens[tokens.length - 1].value}" at the end of "${expr}"`);
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
    
      return resExpr[0];
    }
    
    function parseParenthesDice(tokenExpr) {
      let start = -1;
      let parenthesCount = 0;
    
      for(let i = 0; i < tokenExpr.length; i++) { 
        if(tokenExpr[i].type === 'parenthes') {
          if(tokenExpr[i].value === '(') {
            parenthesCount++;
            start = i;
          }
          else if(tokenExpr[i].value === ')') {
            parenthesCount--;
            if(parenthesCount === 0) {
              const subExpr = tokenExpr.slice(start + 1, i);
              const result = parseExpr(subExpr);
              tokenExpr.splice(start, i - start + 1, result);
              i = start;
            }
            else if (parenthesCount < 0){
              throw new Error(`At least one extra parenthesis in "${expression}"`);
            }
          }
        }
      }
    
      let i = 0;
      while(i < tokenExpr.length) {
        const token = tokenExpr[i];
        if(token.type === 'number' && i + 2 < tokenExpr.length) {
          if(tokenExpr[i + 1].type === 'dice' && tokenExpr[i + 2].type === 'number') {
            const numOfDices = token.value;
            const numOfSides = tokenExpr[i + 2].value;
    
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