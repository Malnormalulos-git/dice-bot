const { Events } = require('discord.js');
const { BOT_STATUS, BOT_ACTIVITY } = require('../config');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setPresence({
			status: BOT_STATUS,
			activities: [BOT_ACTIVITY]
		});
	},
};