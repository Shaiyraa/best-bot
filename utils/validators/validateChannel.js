const logger = require('../../logger');
const config = require('../../config.json');

const validateChannel = async (message) => {
  let response = "";

  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
    .then(m => {
      m = m.first();
      if (!m || m.content.startsWith(config.prefix)) {
        response = "exit";
      } else if (m.content.toLowerCase() === "exit") {
        response = "exit";
      } else {
        response = m.content;
      };
    })
    .catch((err) => {
      response = "exit";
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
    });

  if (response === "exit") return response;

  response = response.replace(/([<>&#])+/g, "");
  if (message.guild.channels.cache.get(response)) return response;

  if (response !== "exit") message.channel.send("Invalid channel");
  return await validateChannel(message);
}

module.exports = validateChannel;