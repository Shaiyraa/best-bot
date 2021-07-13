const axios = require('axios');

module.exports = async (message, guildConfig) => {
  let res;
  try {
    res = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/users/discord/${message.author.id}`,
      data: {
        guild: guildConfig._id
      }
    });

  } catch (err) {
    message.channel.send("Profile not found. Try ?profile create");
    console.log(err);
    return false;
  };

  return res.data.data.user
}