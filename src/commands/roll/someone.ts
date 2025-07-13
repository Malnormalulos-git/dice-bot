import {CommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import {RandomMemberSelector} from '../../business-logic/randomMember/RandomMemberSelector';
import {createSomeoneCommand} from "../../utils/commandBuilders/createSomeoneCommand";

const someone: Command = {
    data: createSomeoneCommand('someone', 'Chooses one random participant from voice channel'),
    async execute(interaction: CommandInteraction) {
        await RandomMemberSelector.executeFromInteraction(interaction);
    }
};

export default someone;