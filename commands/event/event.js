const Discord = require("discord.js");
const createEvent = require("./createEvent")
const listEvents = require("./listEvents")
const sendEmbedMessage = require("../../utils/sendEmbedMessage")

module.exports.run = async (bot, message, args) => {

  switch (args[0]) {
    case "create": {
      createEvent(message, args[1], args[2]);
      break;
    };
    case "list": {
      listEvents(message, args[1])
      break;
    };
    case "edit": {
      message.channel.send("edit goes here");
      break;
    };
    default: {
      sendEmbedMessage(message.channel, "Options:", [
        "?event create - to create new event"
      ]);
    };
  };
};

module.exports.help = {
  name: "event",
  description: "asd"
};