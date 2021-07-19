const Discord = require('discord.js');
const createGroup = require('./createGroup');
const showGroup = require('./showGroup');
const listGroups = require('./listGroups');
const editGroup = require('./editGroup');
const deleteGroup = require('./deleteGroup');
const assignGroup = require('./assignGroup');

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
      createGroup(message, guildConfig, args[1]);
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
      editGroup(message, guildConfig, args[1]);
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
      sendEmbedMessage(message.channel, "Options:", [
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
      ]);
    };
  };
};

module.exports.help = {
  name: "group",
  description: "Manage nodewar groups. Restricted to officers only.\n?group to learn more"
};