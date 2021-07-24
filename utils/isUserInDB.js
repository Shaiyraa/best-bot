const axios = require('axios');
const logger = require('../logger');

module.exports = async (memberId, guildId) => {
  let res;
  try {
    res = await axios({
      method: 'GET',
      url: `${process.env.API_URL}/api/v1/users/discord/${memberId}`,
      data: {
        guild: guildId
      }
    });

  } catch (err) {
    logger.log({
      level: 'error',
      timestamp: Date.now(),
      commandAuthor: null,
      message: err
    });
    return false;
  };

  return res.data.data.user
}