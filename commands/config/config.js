const createConfig = require('./createConfig');
const editConfig = require('./editConfig');
const sendEmbedMessage = require('../../utils/sendEmbedMessage');

module.exports.run = async (bot, message, args) => {

  switch (args[0]) {
    case "create": {
      createConfig(message);
      break;
    };
    case "edit": {
      editConfig(message);
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
  description: "manage guild config options"
};