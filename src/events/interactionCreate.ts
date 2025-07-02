import {Events, MessageFlags} from "discord.js";
import {Event} from "../types/types";
import {UserError} from "../business-logic/errors/UserError";

const EPHEMERAL_COMMANDS = ['help'];

const interactionCreate: Event = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                const isEphemeral = EPHEMERAL_COMMANDS.includes(interaction.commandName);
                await interaction.deferReply({flags: [isEphemeral ? MessageFlags.Ephemeral : 0]});

                await command.execute(interaction);
            } catch (error) {
                let errorMessage: string;
                if (error instanceof UserError) {
                    errorMessage = error.toString();
                }
                else {
                    console.error(error);
                    errorMessage = 'There was an error while executing this command!';
                }

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: errorMessage,
                        flags: [MessageFlags.Ephemeral]
                    });
                } else {
                    await interaction.editReply({
                        content: errorMessage,
                        flags: [MessageFlags.Ephemeral]
                    });
                }
            }
        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                if (command && command.autocomplete) {
                    await command.autocomplete(interaction);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
};

export default interactionCreate;