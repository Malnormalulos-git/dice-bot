const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();
const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// delete all old commands
rest.put(Routes.applicationCommands(clientId), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);