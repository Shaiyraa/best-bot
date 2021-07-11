const Discord = require('discord.js');
const fs = require('fs');
const createConfig = require('./createConfig');
const sendEmbedMessage = require('../../utils/sendEmbedMessage');

module.exports.run = async (bot, message, args) => {
  switch (args[0]) {
    case "create": {
      createConfig(message);
      break;
    };
    case "edit": {
      message.channel.send("code it ffs");
      break;
    };
    default: {
      sendEmbedMessage(message.channel, "Options:", [
        "?config create - to create config",
        "?config edit - to update existing one"
      ]);
    };
  };

};

module.exports.help = {
  name: "config",
  description: "asd"
};