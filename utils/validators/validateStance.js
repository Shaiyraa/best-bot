const Discord = require("discord.js");
const logger = require('../../logger');
const config = require("../../config.json");

const validateStance = async (message) => {
  let response = "";

  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
    .then(m => {
      m = m.first();
      if (!m || m.content.startsWith(config.prefix)) {
        return "exit";
      } else if (m.content.toLowerCase() === "exit") {
        return response = "exit";
      };
      response = m.content.toLowerCase();
    })
    .catch((err) => {
      logger.log({
        level: 'error',
        timestamp: Date.now(),
        commandAuthor: {
          id: message.author.id,
          username: message.author.username,
          tag: message.author.tag
        },
        message: err
      });
      return "exit"
    });

  if (response === "succ" || response === "s") response = "succession"
  if (response === "awa" || response === "a") response = "awakening"

  if (config.stance.includes(response)) return response;

  message.channel.send("Invalid response.");
  return await validateStance(message);
};

module.exports = validateStance;