const axios = require('axios');

module.exports = async (message, guildId) => {
  let id = guildId || message.guild.id;

  // 1. FIND GUILD
  let res
  try {
    res = await axios.get(`${process.env.API_URL}/api/v1/guilds/discord/${id}`);

    return res.data.data.guild
  } catch (err) {

    if (err.response.status === 404) {
      message.channel.send("Guild config is not set yet, please contact your guildmaster or officers.");
    } else {
      message.channel.send("There was a problem with your request. Please, try again later.");
      console.log(err);
    }

    return false;
  };
};
