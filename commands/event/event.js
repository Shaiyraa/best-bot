const Discord = require("discord.js");
const createEvent = require("./createEvent");
const listEvents = require("./listEvents");
const listArchived = require("./listArchived");

const config = require('../../config.json');
const isGuildInDB = require('../../utils/isGuildInDB');
const sendEmbedMessage = require("../../utils/sendEmbedMessage");
const hasRole = require('../../utils/hasRole');

module.exports.run = async (bot, message, args) => {

  // 1. CHECK IF CONFIG EXISTS
  const guildConfig = await isGuildInDB(message);
  if (!guildConfig) return;

  // 2. CHECK IF OFFICER
  const isOfficer = await hasRole(message, guildConfig.officerRole)
  if (!isOfficer) return message.channel.send(`Only <@&${guildConfig.officerRole}> can use this command.`, { "allowedMentions": { "users": [] } });

  switch (args[0]) {
    case "create": {
      const [first, ...otherArgs] = args
      createEvent(bot, message, guildConfig, otherArgs);
      break;
    };
    case "list": {
      listEvents(message, guildConfig);
      break;
    };
    case "archive": {
      const pastDate = args[1]
      listArchived(message, guildConfig, pastDate);
      break;
    };
    default: {
      const basicOptions = [
        "**create**",
        "• `?event create` - to create new event",
        "\n**display**",
        "• `?event list` - to display all events and manage them",
        "• `?event archive` - to display all past events, manage them and see their stats",
        "• `?event archive [dd/mm/yyyy]` - to display all past events from this date, manage them and see their stats",
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
          "**create**",
          "• `?event create` - to create new event",
          "• `?event create [date: dd/mm/yyyy] [hour: hh:mm] [type] [max participants] [alerts: true/false] [mandatory: true/false]` - to create new nodewar quicker; example: _?event 20.12.2022 20:00 nodewar 30 true true_ will create a new, mandatory nodewar on december 20th 2022, with 30 max participants, that has alerts enabled",
          "• `?event create [date: dd/mm/yyyy] [hour: hh:mm] [type] [max participants]` - you can also specify only first few params and others will be filled with default values; example: _?event 20.12.2022 20:00 nodewar_ will create a new, mandatory nodewar on december 20th 2022, with 100 max participants, that has alerts disabled",
          "\n**display**",
          "• `?event list` - to display all events and manage them",
          "• `?event archive` - to display all past events, manage them and see their stats",
          "• `?event archive [dd/mm/yyyy]` - to display all past events from this date, manage them and see their stats"
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
  name: "event",
  description: "Manage guild events. Restricted to officers only.\n?event to learn more"
};