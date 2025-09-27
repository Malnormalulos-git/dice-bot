import {ChatInputCommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import {RandomMemberSelector} from '../../core/randomMember/RandomMemberSelector';
import {createSomeoneCommand} from "../../utils/commandBuilders/createSomeoneCommand";

const someoneExceptMe: Command = {
    data: createSomeoneCommand('someone-except-me', 'Chooses one random participant from voice channel except you'),
    async execute(interaction: ChatInputCommandInteraction) {
        await RandomMemberSelector.executeFromInteraction(
            interaction,
            (member, invoker) => member.id !== invoker.id);
    }
};

export default someoneExceptMe;