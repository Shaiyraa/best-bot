const axios = require('axios');
const logger = require('../../logger');

module.exports = async (guildId) => {

  // 1. FETCH ALL MEMBERS
  let res;
  try {
    res = await axios.get(`${process.env.API_URL}/api/v1/users/`, {
      guild: guildId
    });
  } catch (err) {
    return logger.log({
      level: 'error',
      timestamp: Date.now(),
      commandAuthor: {
        id: message.author.id,
        username: message.author.username,
        tag: message.author.tag
      },
      message: err
    });
  };

  if (!res.data.results) return;

  const members = res.data.data.users;

  // 2. DELETE PROFILES
  members.forEach(member => {
    console.log(`Deleting ${member.familyName}`)

    // TODO: uncomment me when going prod
    //deleteMemberProfileFromDB(member.id, guildId, "bot");
  });
};