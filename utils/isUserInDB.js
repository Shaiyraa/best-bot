const axios = require('axios');

module.exports = async (memberId, guildId) => {
  let res;
  try {
    res = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/users/discord/${memberId}`,
      data: {
        guild: guildId
      }
    });

  } catch (err) {
    console.log(err);
    return false;
  };

  return res.data.data.user
}