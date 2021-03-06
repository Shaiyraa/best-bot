const logger = require('../../logger');
const config = require("../../config.json");

const validateResponse = async (message, errMessage, conditions) => {
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
      response = "exit"
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

  if (conditions.includes(response) || response === "exit") {
    return response;
  };

  message.channel.send(errMessage);
  return await validateResponse(message, errMessage, conditions);
};

module.exports = validateResponse;