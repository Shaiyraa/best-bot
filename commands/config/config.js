const createConfig = require('./createConfig');
const showConfig = require('./showConfig');
const editConfig = require('./editConfig');
const sendEmbedMessage = require('../../utils/sendEmbedMessage');

module.exports.run = async (bot, message, args) => {

  // 1. CHECK IF ADMIN
  if (!message.member.hasPermission("ADMINISTRATOR")) {
    message.channel.send("Only administrators can this command.")
    return
  }

  switch (args[0]) {
    case "create": {
      createConfig(message);
      break;
    };
    case "show": {
      showConfig(message);
      break;
    };
    case "edit": {
      editConfig(message, args[1]);
      break;
    };
    default: {
      sendEmbedMessage(message.channel, "Options:", [
        "**create**",
        "• ?config create - to create config",
        "\n**display**",
        "• ?config show - to display current config",
        "\n**modify**",
        "• ?config edit - to update config",
        "\nConfig related commands are restricted to server admins only."
      ]);
    };
  };

};

module.exports.help = {
  name: "config",
  description: "Manage guild config options. Restricted to server admins only.\n?config to learn more"
};