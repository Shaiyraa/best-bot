const axios = require('axios');
const logger = require('../logger');
const isUserInDB = require('./isUserInDB');

module.exports = async (memberId, guildId, deletedBy) => {
  // find user
  const user = await isUserInDB(memberId, guildId);
  if (!user) return false

  try {
    await axios.delete(`${process.env.API_URL}/api/v1/users/${user._id}?deletedBy=${deletedBy}`);
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
    return false
  };
  return true
};