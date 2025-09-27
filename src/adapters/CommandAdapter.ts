import {GuildMember, MessageCollectorOptionsParams, MessageComponentType} from "discord.js";

export default interface CommandAdapter {
    member: GuildMember;
    reply: (options: any) => Promise<any>;
    editReply: (options: any) => Promise<any>;
    createCollector: (options: MessageCollectorOptionsParams<MessageComponentType, boolean>) => any;
    getUserId: () => string;
    getCommandId: () => string;
};
