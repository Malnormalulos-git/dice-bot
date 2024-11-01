const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows information about Dice Rolling Bot commands'),
  async execute(interaction) {
    const helpEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎲 Dice Rolling Bot - Help')
      .setDescription('Roll dice with various expressions!')
      .addFields(
        { 
          name: '📌 Basic Usage', 
          value: '`/roll XdY` - Roll X dice with Y sides\n' +
                 'Example: `/roll 2d6` rolls two six-sided dice\n' +
                 '`/r XdY` - Same as /roll, just shorter!' 
        },
        { 
          name: '🎯 Advanced Expressions', 
          value: '- `3d6+5`: Roll 3d6 and add 5\n' +
                 '- `(2d4)*2`: Roll 2d4 and multiply the result by 2\n' +
                 '- `1d20+3d6`: Mix different dice types'
        },
        { 
          name: '⚙️ Supported Operations', 
          value: '`()` Grouping parentheses\n' +
                 '`*` Multiplication\n' +
                 '`/` Division\n' +
                 '`+` Addition\n' +
                 '`-` Subtraction'
        },
        { 
          name: '📝 Example Expressions', 
          value: '`/r 2d20+5`: Roll two d20s and add 5\n' +
                 '`/roll (1d20+5)*2`: Roll d20, add 5, and multiply everything by 2'
        },
        { 
          name: '💻 Source Code', 
          value: '[GitHub](https://github.com/Malnormalulos-git/dice-bot.git)'
        }
      )
      .setFooter({ text: 'Created with ❤️ for tabletop gaming enthusiasts' })
      .setTimestamp();

    await interaction.reply({ 
      embeds: [helpEmbed],
      ephemeral: true 
    });
  },
};