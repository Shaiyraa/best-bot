const axios = require('axios');
const logger = require('../../logger');
const isGuildInDB = require('../../utils/isGuildInDB')

module.exports = async (message, guildConfig, value) => {

  if (!value || (value !== "false" && value !== "true")) {
    return message.channel.send(`Please, provide also the value - use ?profile private [true/false]`);
  }

  // convert to boolean
  if (value === "true") {
    value = true
  } else {
    value = false
  }

  // 1. FIND USER 
  let resUser;
  try {
    resUser = await axios({
      method: 'GET',
      url: `${process.env.API_URL}/api/v1/users/discord/${message.author.id}`,
      data: {
        guild: guildConfig._id
      }
    });
  } catch (err) {
    if(err.response.status === 404) return message.channel.send("Profile not found.");
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
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  const user = resUser.data.data.user;

  // 2. UPDATE
  let res;
  try {
    res = await axios.patch(`${process.env.API_URL}/api/v1/users/${user._id}?private=${value}`, {
      private: value
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
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  message.channel.send(`Profile visibility set to ${value ? "private" : "public"}!`);
};