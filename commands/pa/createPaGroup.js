const axios = require('axios');
const logger = require('../../logger');
const validateResponseRegex = require('../../utils/validators/validateResponseRegex');

module.exports = async (message, guildConfig, groupName, size) => {

  if (!groupName) {
    // 1. ASK FOR GROUP NAME
    message.channel.send("What is the name of the PA group?");
    groupName = await validateResponseRegex(message, "Invalid PA group name (Only letters, numbers and _ allowed).", /^([a-zA-Z][a-zA-Z0-9_]{0,10})$/g);
    if (groupName === "exit") return message.channel.send("Bye!");
  } else {
    if (!groupName.match(/^([a-zA-Z][a-zA-Z0-9_]{0,10})$/g)) return message.channel.send("Invalid PA group name (Only letters, numbers and _ allowed).");
  }

  if (!size) {
    // 1. ASK FOR SIZE
    message.channel.send("What is the size of the PA group?");
    size = await validateResponseRegex(message, "Invalid size.", /^[1-9][0-9]?$|^100$/g);
    if (size === "exit") return message.channel.send("Bye!");

  } else {
    if (!size.match(/^[1-9][0-9]?$|^100$/g)) return message.channel.send("Invalid size.");
  }

  // 2. POST THE GROUP TO DB
  let res;
  try {
    res = await axios.post(`${process.env.API_URL}/api/v1/guilds/${guildConfig._id}/pa-groups`, {
      name: groupName,
      maxCount: size
    });
  } catch (err) {
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
    if (err.response.status === 403) return message.channel.send("A PA group with this name already exists.");
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  // 3. SEND RESPONSE
  message.channel.send("PA group created.");
};