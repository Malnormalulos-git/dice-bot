import {SlashCommandBuilder, AutocompleteInteraction, CommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import {RandomMemberSelector} from '../../business-logic/randomMember/RandomMemberSelector';

const someoneExceptMe: Command = {
    data: new SlashCommandBuilder()
        .setName('someone-except-me')
        .setDescription('Chooses one random participant from voice channel except you')
        // .addStringOption(option =>
        //     option
        //         .setName('exclude')
        //         .setDescription('Exclude specific users from the sample')
        //         .setAutocomplete(true)
        // )
    ,
    async autocomplete(interaction: AutocompleteInteraction) {
        await RandomMemberSelector.handleAutocomplete(
            interaction,
            (choice, invoker) => choice.value !== invoker.id);
    },
    async execute(interaction: CommandInteraction) {
        await RandomMemberSelector.execute(
            interaction,
            (member, invoker) => member.id !== invoker.id);
    }
};

export default someoneExceptMe;