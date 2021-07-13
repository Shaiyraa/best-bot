const axios = require('axios');
const isGuildInDB = require('../../utils/isGuildInDB')

module.exports = async (message, guildConfig, value) => {

  if (!value) {
    message.channel.send(`Please, provide also the value - use ?profile private [true/false]`);
  }

  // 1. FIND USER 
  let resUser;
  try {
    resUser = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/users/discord/${message.author.id}`,
      data: {
        guild: guildConfig._id
      }
    });
  } catch (err) {
    console.log(err);
    return message.channel.send(err.response.data.message);
  };

  const user = resUser.data.data.user;

  // 2. UPDATE
  let res;
  try {
    res = await axios.patch(`http://localhost:3000/api/v1/users/${user._id}?private=${value}`, {
      private: value
    });
  } catch (err) {
    console.log(err);
    return message.channel.send(err.response.data.message);
  };

  message.channel.send(`Profile visibility set to ${value ? "private" : "public"}!`);
};