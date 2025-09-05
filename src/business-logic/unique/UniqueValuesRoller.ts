import {randomNumber} from "../random/randomNumber";
import CommandAdapter from "../adapters/CommandAdapter";
import InteractionAdapter from "../adapters/InteractionAdapter";
import MessageAdapter from "../adapters/MessageAdapter";
import parseOptions from "../utils/parseOptions";
import unique from "../../commands/roll/unique";
import {UserError} from "../errors/UserError";
import {CommandInteraction, Message} from "discord.js";
import {handleLargeOutput} from "../utils/outputFormatting";

export class UniqueValuesRoller {
    /**
     * Core logic - works with any adapter
     */
    private static async executeWithAdapter(
        adapter: CommandAdapter,
        options: {
            count?: number;
            size?: number;
        } = {}
    ): Promise<void> {
        const {count = 1, size = 1} = options;

        if (count > size) {
            throw new UserError('Count cannot be greater than size!');
        }

        const valuesSet = new Set(Array.from({length: size}, (_, index) => index + 1));
        const resultsSet = new Set();

        while (resultsSet.size < count) {
            const valuesArray = Array.from(valuesSet);
            const randomIndex = randomNumber(size - resultsSet.size) - 1;
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
        const size = interaction.options.getNumber('size') || undefined;

        await this.executeWithAdapter(adapter, {count, size});
    }

    /**
     * Execute from Message
     */
    static async executeFromMessage(message: Message, input: string): Promise<void> {
        const adapter = new MessageAdapter(message);

        const commandOptions = unique.data.options;
        const parsedOptions = parseOptions(input, commandOptions);

        const count = parsedOptions.count as number;
        const size = parsedOptions.size as number;

        await this.executeWithAdapter(adapter, {count, size});
    }
}