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
        return {error: `Invalid operator placement: "${char}" in expression "${expr}"`};
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
      return {error: `Invalid character: "${char}" in expression "${expr}"`};
    }
  }
  
  if (current) {
    tokens.push({type: 'number', value: parseInt(current)});
  } 
  // Error if expression ends on operator or 'd'
  else if ('+-*/d'.includes(tokens[tokens.length - 1].value)) {
    return {error: `Expression cannot end with an operator or 'd': "${tokens[tokens.length - 1].value}" at the end of "${expr}"`};
  }

  return tokens;
}

module.exports = { tokenize };