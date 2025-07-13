import CommandAdapter from "./CommandAdapter";
import {
    CommandInteraction,
    GuildMember,
    MessageCollectorOptionsParams,
    MessageComponentType
} from "discord.js";

export default class InteractionAdapter implements CommandAdapter {
    constructor(private interaction: CommandInteraction) {
    }

    get member() {
        return this.interaction.member as GuildMember;
    }

    async reply(options:  any) {
        return await this.interaction.reply(options);
    }

    async editReply(options: any) {
        return this.interaction.editReply(options);
    }

    getUserId() {
        return this.interaction.user.id;
    }

    getCommandId() {
        return this.interaction.id;
    }

    async createCollector(options: MessageCollectorOptionsParams<MessageComponentType, boolean>) {
        return await this.interaction.fetchReply().then(reply =>
            reply.createMessageComponentCollector(options)
        );
    }
}