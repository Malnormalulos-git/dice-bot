import {SlashCommandBuilder, AutocompleteInteraction, CommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import {RandomMemberSelector} from '../../business-logic/randomMember/RandomMemberSelector';

const someone: Command = {
    data: new SlashCommandBuilder()
        .setName('someone')
        .setDescription('Chooses one random participant from voice channel')
        .addStringOption(option =>
            option
                .setName('exclude')
                .setDescription('Exclude specific users from the sample')
                .setAutocomplete(true)
        ),
    async autocomplete(interaction: AutocompleteInteraction) {
        await RandomMemberSelector.handleAutocomplete(interaction);
    },
    async execute(interaction: CommandInteraction) {
        await RandomMemberSelector.execute(interaction);
    }
};

export default someone;