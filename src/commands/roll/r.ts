import {Command} from '../../types/types';
import {roll} from './roll';
import {createRollDiceCommand} from "../../utils/commandBuilders/createRollDiceCommand";

const r: Command = {
    data: createRollDiceCommand('r', 'Same as /roll, just shorter!'),
    execute: roll.execute
};

export default r;