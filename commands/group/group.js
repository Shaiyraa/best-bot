const Discord = require('discord.js');
const createGroup = require('./createGroup');
const showGroup = require('./showGroup');
const listGroups = require('./listGroups');
const editGroup = require('./editGroup');
const deleteGroup = require('./deleteGroup');
const assignGroup = require('./assignGroup');

const config = require('../../config.json');
const sendEmbedMessage = require('../../utils/sendEmbedMessage');
const isGuildInDB = require('../../utils/isGuildInDB');
const hasRole = require('../../utils/hasRole');

module.exports.run = async (bot, message, args) => {

  // 1. CHECK IF GUILD IS IN DB
  const guildConfig = await isGuildInDB(message);
  if (!guildConfig) return;

  // 2. CHECK IF OFFICER
  const isOfficer = await hasRole(message, guildConfig.officerRole)
  if (!isOfficer) return message.channel.send(`Only <@&${guildConfig.officerRole}> can use this command.`, { "allowedMentions": { "users": [] } });

  switch (args[0]) {
    case "create": {
      createGroup(message, guildConfig, args[1], args[2]);
      break;
    };
    case "show": {
      showGroup(message, guildConfig, args[1]);
      break;
    };
    case "list": {
      listGroups(message, guildConfig);
      break;
    };
    case "edit": {
      const param = args[2]
      const value = args[3]
      editGroup(message, guildConfig, args[1], param, value);
      break;
    };
    case "delete": {
      deleteGroup(message, guildConfig, args[1]);
      break;
    };
    case "assign": {
      assignGroup(message, guildConfig, args[1], args[2]);
      break;
    };
    default: {
      const basicOptions = [
        "**create**",
        "• ?group create - to create new group",
        "\n**display**",
        "• ?group show [group] - to show group details",
        "• ?group list - to manage the groups",
        "\n**modify**",
        "• ?group edit [group] - to edit group details",
        "\n**delete**",
        "• ?group delete [group] - to delete a group",
        "\n**other**",
        "• ?group assign [group] [familyName] - to assign group to one guild members",
        "• ?group assign [group] - to assign group to many guild members"
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
          "• ?group create - to create new group",
          "• ?group create [name] [size] - to create new group using quick setup",
          "\n**display**",
          "• ?group show [group] - to show group details",
          "• ?group list - to manage the groups",
          "\n**modify**",
          "• ?group edit [group] - to edit group details",
          "\n**delete**",
          "• ?group delete [group] - to delete a group",
          "\n**other**",
          "• ?group assign [group] [familyName] - to assign group to one guild members",
          "• ?group assign [group] - to assign group to many guild members"
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
  name: "group",
  description: "Manage nodewar groups. Restricted to bot masters only.\n?group to learn more"
};