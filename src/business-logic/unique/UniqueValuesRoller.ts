import {randomNumber} from "../random/randomNumber";
import CommandAdapter from "../adapters/CommandAdapter";
import InteractionAdapter from "../adapters/InteractionAdapter";
import MessageAdapter from "../adapters/MessageAdapter";
import parseOptions from "../utils/parseOptions";
import unique from "../../commands/roll/unique";
import {CommandInteraction, Message} from "discord.js";
import {handleLargeOutput} from "../utils/outputFormatting";
import {config} from "../../../config";

const {MAX_DICE_COUNT, MAX_DICE_SIDES} = config;

export class UniqueValuesRoller {
    /**
     * Core logic - works with any adapter
     */
    private static async executeWithAdapter(
        adapter: CommandAdapter,
        options: {
            count?: number;
            sides?: number;
        } = {}
    ): Promise<void> {
        const {count = 0, sides = 0} = options;

        if (count > sides) {
            await adapter.editReply('Count cannot be greater than number of sides!');
            return;
        } else if (count <= 0 || sides <= 0) {
            await adapter.editReply('Count and number of sides must be greater than 0!');
            return;
        } else if (count > MAX_DICE_COUNT || sides > MAX_DICE_SIDES) {
            await adapter.editReply(`Too big number of dice or sides. Maximum is ${MAX_DICE_COUNT}d${MAX_DICE_SIDES}`);
            return;
        }

        const valuesSet = new Set(Array.from({length: sides}, (_, index) => index + 1));
        const resultsSet = new Set();

        while (resultsSet.size < count) {
            const valuesArray = Array.from(valuesSet);
            const randomIndex = randomNumber(sides - resultsSet.size) - 1;
            const value = valuesArray[randomIndex];

            valuesSet.delete(value);
            resultsSet.add(value);
        }

        const resultsArray = Array.from(resultsSet);
        const output = `# ${resultsArray.join('; ')}`;

        const formattedOutput = handleLargeOutput(output, undefined, false, 'unique-values.txt');

        await adapter.editReply(formattedOutput);
    }


    /**
     * Execute from SlashCommand
     */
    static async executeFromInteraction(interaction: CommandInteraction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const adapter = new InteractionAdapter(interaction);
        const count = interaction.options.getNumber('count') || undefined;
        const sides = interaction.options.getNumber('sides') || undefined;

        await this.executeWithAdapter(adapter, {count, sides: sides});
    }

    /**
     * Execute from Message
     */
    static async executeFromMessage(message: Message, input: string): Promise<void> {
        const adapter = new MessageAdapter(message);

        const commandOptions = unique.data.options;
        const parsedOptions = parseOptions(input, commandOptions);

        const count = parsedOptions.count as number;
        const sides = parsedOptions.sides as number;

        await this.executeWithAdapter(adapter, {count, sides: sides});
    }
}