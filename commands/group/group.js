const Discord = require('discord.js');
const createGroup = require('./createGroup');
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
    case "list": {
      listGroups(message, guildConfig);
      break;
    };
    case "edit": {
      editGroup(message, guildConfig);
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
        "?group create - to create new group",
        "?group edit - to edit a group",
        "?group delete - to delete a group",
        "?group list - to manage existing groups",
        "?group assign [group] [familyName] - to assign group to one guild members",
        "?group assign [group] - to assign group to many guild members"
      ]);
    };
  };
};

module.exports.help = {
  name: "group",
  description: "manage nodewar groups"
};