const { execute } = require('./roll.js');
const { createRollDiceCommand } = require("../../business-logic/utils/commandBuilders/createRollDiceCommand");

module.exports = {
    data: createRollDiceCommand('r', 'Roll dice (shortened version)'),
    execute: execute 
};