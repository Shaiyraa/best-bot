const logger = require('../../logger');
const config = require("../../config.json");

const validateContent = async (message) => {
  let response = "";

  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 120000 })
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

  if (response.length <= 1024 && response.length > 0 || response === "exit") {
    return response;
  };

  message.channel.send("Your message is too long (max. 1024 characters allowed) or the format is invalid!");
  return await validateContent(message);
};

module.exports = validateContent;