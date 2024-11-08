const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();
const clientId = process.env.CLIENT_ID;
const devGuildId =  process.env.DEV_GUILD_ID;
const token = process.env.TOKEN;

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// delete all old commands
rest.put(Routes.applicationGuildCommands(clientId, devGuildId), { body: [] })
	.then(() => console.log('Successfully deleted all dev guild commands.'))
	.catch(console.error);