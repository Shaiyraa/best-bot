const Discord = require("discord.js");
const fs = require("fs");
const sendEmbedMessage = require("../../utils/sendEmbedMessage");

module.exports.run = async (bot, message, args) => {
  fs.readdir("./commands/", async (err, files) => {
    if (err) console.error(err);
    if (files.length <= 0) return console.log("Couldn't find commands.");

    let results = files.map((f) => {
      let props = require(`../${f}/${f}.js`);
      return {
        name: props.help.name || '',
        description: props.help.description || ''
      };
    });

    const commandsArray = results.map(item => `\n**${item.name}** \n${item.description}`)
    commandsArray.push("\nIf you want to exit a command at any point, type **exit**.");
    await sendEmbedMessage(message.channel, "Available commands:", commandsArray)
  });
};

module.exports.help = {
  name: "help",
  description: "Displays the list of available commands."
};