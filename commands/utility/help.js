const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Show help information for the Dice Rolling Bot'),
	async execute(interaction) {
		const helpEmbed = new EmbedBuilder()
			.setColor('#5865F2')
			.setTitle('Dice Rolling Bot - Help')
			.setDescription('Roll dice with complex expressions!')
			.addFields(
				{ 
					name: 'Basic Usage', 
					value: '`/roll XdY` - Roll X number of Y-sided dice\n' +
						   'Example: `/roll 2d6` rolls two 6-sided dice' 
				},
				{ 
					name: 'Advanced Expressions', 
					value: '- `3d6+5`: Roll 3d6 and add 5\n' +
						   '- `(2d4)*2`: Roll 2d4 and multiply result by 2\n' +
						   '- `1d20+3d6`: Mix different dice types' 
				},
				{ 
					name: 'Supported Operations', 
					value: '`()` Parentheses\n`*` Multiplication\n`/` Division\n`+` Addition\n`-` Subtraction' 
				},
        { 
          name: 'Source code', 
          iconURL: 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png',
          value: '[GitHub](https://github.com/Malnormalulos-git/dice-bot.git)' 
        }
			)
			.setTimestamp();

		await interaction.reply({ 
			embeds: [helpEmbed],
			ephemeral: true 
		});
	},
};