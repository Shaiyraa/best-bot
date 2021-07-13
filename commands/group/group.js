const Discord = require('discord.js');
const createGroup = require('./createGroup');
const assignGroup = require('./assignGroup');
const deleteGroup = require('./deleteGroup');
const sendEmbedMessage = require('../../utils/sendEmbedMessage');

module.exports.run = async (bot, message, args) => {
  switch (args[0]) {
    case "create": {
      createGroup(message, args[1]);
      break;
    };
    case "edit": {
      message.channel.send("code it ffs");
      break;
    };
    case "assign": {
      assignGroup(message, args[1], args[2]);
      break;
    };
    case "delete": {
      deleteGroup(message, args[1]);
      break;
    };
    default: {
      sendEmbedMessage(message.channel, "Options:", [
        "?group create - to create new group",
        "?group list - to manage existing groups",
        "?group assign [group] [familyName] - to assign group to one guild members",
        "?group assign [group] - to assign group to many guild members"
      ]);
    };
  };

};

module.exports.help = {
  name: "group",
  description: "asd"
};