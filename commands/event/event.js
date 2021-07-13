const Discord = require("discord.js");
const createEvent = require("./createEvent");
const listEvents = require("./listEvents");

const isGuildInDB = require('../../utils/isGuildInDB');
const sendEmbedMessage = require("../../utils/sendEmbedMessage");

module.exports.run = async (bot, message, args) => {

  // 1. CHECK IF CONFIG EXPISTS
  const guildConfig = await isGuildInDB(message);
  if (!guildConfig) return;

  switch (args[0]) {
    case "create": {
      createEvent(message, guildConfig, args[1]);
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