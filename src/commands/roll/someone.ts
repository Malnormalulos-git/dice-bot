import {ChatInputCommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import {RandomMemberSelector} from '../../core/randomMember/RandomMemberSelector';
import {createSomeoneCommand} from "../../utils/commandBuilders/createSomeoneCommand";

const someone: Command = {
    data: createSomeoneCommand('someone', 'Chooses one random participant from voice channel'),
    async execute(interaction: ChatInputCommandInteraction) {
        await RandomMemberSelector.executeFromInteraction(interaction);
    }
};

export default someone;