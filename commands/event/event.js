const Discord = require("discord.js");
const createEvent = require("./createEvent");
const listEvents = require("./listEvents");

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
      createEvent(bot, message, guildConfig, args[1]);
      break;
    };
    case "list": {
      listEvents(message, guildConfig, args[1]);
      break;
    };
    default: {
      sendEmbedMessage(message.channel, "Options:", [
        "?event create - to create new event",
        "?event list - to list all events and manage them"
      ]);
    };
  };
};

module.exports.help = {
  name: "event",
  description: "manage guild events"
};