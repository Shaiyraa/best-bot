const Discord = require('discord.js');
const createPaGroup = require('./createPaGroup');
const showPaGroup = require('./showPaGroup');
const listPaGroups = require('./listPaGroups');
const editPaGroup = require('./editPaGroup');
const deletePaGroup = require('./deletePaGroup');
const assignPaGroup = require('./assignPaGroup');
const removePaGroup = require('./removePaGroup');

const config = require('../../config.json');
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
      createPaGroup(message, guildConfig, args[1], args[2]);
      break;
    };
    case "show": {
      showPaGroup(message, guildConfig, args[1]);
      break;
    };
    case "list": {
      listPaGroups(message, guildConfig);
      break;
    };
    case "edit": {
      const param = args[2]
      const value = args[3]
      editPaGroup(message, guildConfig, args[1], param, value);
      break;
    };
    case "delete": {
      deletePaGroup(message, guildConfig, args[1]);
      break;
    };
    case "assign": {
      assignPaGroup(message, guildConfig, args[1], args[2]);
      break;
    };
    case "remove": {
      removePaGroup(message, guildConfig, args[1]);
      break;
    };
    default: {
      const basicOptions = [
        "**create**",
        "• ?pa create - to create new PA group",
        "\n**display**",
        "• ?pa show [pa group name] - to show PA group details",
        "• ?pa list - to manage the PA groups",
        "\n**modify**",
        "• ?pa edit [pa group name] - to edit PA group details",
        "\n**delete**",
        "• ?pa delete [pa group name] - to delete a PA group",
        "\n**other**",
        "• ?pa assign [pa group name] [familyName] - to assign PA group to one guild members",
        "• ?pa assign [pa group name] - to assign PA group to many guild members",
        "• ?pa remove [member family name] - to remove PA group from guild member"
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
          "• ?pa create - to create new PA group",
          "• ?pa create [pa group name] [size] - to create new PA group using quick setup",
          "\n**display**",
          "• ?pa show [pa group name] - to show PA group details",
          "• ?pa list - to manage the PA groups",
          "\n**modify**",
          "• ?pa edit [pa group name] - to edit PA group details",
          "\n**delete**",
          "• ?pa delete [pa group name] - to delete PA group",
          "\n**other**",
          "• ?pa assign [pa group name] [familyName] - to assign PA group to one guild members",
          "• ?pa assign [pa group name] - to assign PA group to many guild members",
          "• ?pa remove [member family name] - to remove PA group from guild member"
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
  name: "pa",
  description: "Manage PA groups. Restricted to bot masters only.\n?group to learn more"
};