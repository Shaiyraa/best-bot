const Discord = require('discord.js');
const showBasicStats = require('./showBasicStats');
const showClassesStats = require('./showClassesStats');

const config = require('../../config.json');
const isGuildInDB = require('../../utils/isGuildInDB');
const hasRole = require('../../utils/hasRole');

module.exports.run = async (bot, message, args) => {

  // 1. CHECK IF CONFIG EXISTS
  const guildConfig = await isGuildInDB(message);
  if (!guildConfig) return;

  // 2. CHECK IF OFFICER
  const isOfficer = await hasRole(message, guildConfig.officerRole)
  if (!isOfficer) return message.channel.send(`Only <@&${guildConfig.officerRole}> can use this command.`, { "allowedMentions": { "users": [] } });


  switch (args[0]) {
    case "basic": {
      const group = args[1]
      showBasicStats(message, guildConfig, group)
      break;
    };
    case "classes": {
      const group = args[1]
      showClassesStats(message, guildConfig, group);
      break;
    };
    default: {
      const basicOptions = [
        "• `?stats basic` - to show general guild stats",
        "• `?stats basic [group]` - to show general stats of a group",
        "• `?stats classes` - to show average stats of classes",
        "• `?stats classes [group]` - to show average stats of classes in a grouo",
      ];

      // 1. SEND MESSAGE
      const embed = new Discord.MessageEmbed()
        .setTitle("Options")
        .setDescription(basicOptions)
        .setFooter(`click on the icon to see options for advanced users`);

      const helpMessage = await message.channel.send(embed)

      // 2. REACT WITH DUDE WITH TOOL
      await helpMessage.react(config.advancedUserEmoji)

      // 3. CREATE LISTENER
      const filter = (reaction, user) => {
        if (reaction.emoji.name !== config.advancedUserEmoji) {
          let reactionMap = reactionMessage.reactions.resolve(reaction.emoji.id) || reactionMessage.reactions.resolve(reaction.emoji.name);
          reactionMap?.users.remove(user.id);
        };
        return reaction.emoji.name === config.advancedUserEmoji
      };

      const collector = helpMessage.createReactionCollector(filter, { max: 1, dispose: true });
      collector.on('collect', async (reaction, user) => {

        const advancedOptions = [
          "• `?stats basic` - to show general guild stats",
          "• `?stats basic [group]` - to show general stats of a group",
          "• `?stats classes` - to show average stats of classes",
          "• `?stats classes [group]` - to show average stats of classes in a grouo",
        ]

        const advancedEmbed = new Discord.MessageEmbed()
          .setTitle("Advanced Options")
          .setDescription(advancedOptions);

        // 4. EDIT MESSAGE WITH ADVANCED STUFF
        helpMessage.edit(advancedEmbed);
        helpMessage.reactions.removeAll();
      });
    };
  };
};

module.exports.help = {
  name: "stats",
  description: "See guild stats."
};