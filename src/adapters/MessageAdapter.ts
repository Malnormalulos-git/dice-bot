import {
    GuildMember,
    Message,
    MessageCollectorOptionsParams,
    MessageComponentType
} from "discord.js";
import CommandAdapter from "./CommandAdapter";

export default class MessageAdapter implements CommandAdapter {
    private replyMessage: Message | null = null;

    constructor(private message: Message) {
    }

    get member() {
        return this.message.member as GuildMember;
    }

    async reply(options: any) {
        this.replyMessage = await this.message.reply(options);
        return this.replyMessage;
    }

    async editReply(options: any) {
        if (this.replyMessage) {
            return this.replyMessage.edit(options);
        }
        return this.reply(options);
    }

    getUserId() {
        return this.message.author.id;
    }

    getCommandId() {
        return this.message.id;
    }

    createCollector(options: MessageCollectorOptionsParams<MessageComponentType, boolean>) {
        if (this.replyMessage) {
            return this.replyMessage.createMessageComponentCollector(options);
        }
        throw new Error('No reply message to create collector from');
    }
}