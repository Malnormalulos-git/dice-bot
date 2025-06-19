import {Events} from 'discord.js';
import {Event} from '../types/types';
import {config} from "../../config";

const ready: Event = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setPresence({
            status: config.BOT_STATUS,
            activities: [config.BOT_ACTIVITY]
        });
    }
};

export default ready;