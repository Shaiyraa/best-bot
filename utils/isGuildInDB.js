const axios = require('axios');

module.exports = async (message, guildId) => {
  let id = guildId || message.guild.id;

  // 1. Find guild
  try {
    res = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/guilds/discord/${message.channel.guild.id}`
    });
  } catch (err) {
    // return if theres a problem other than that doc doesn't exist
    if (err.response.status !== 404) {
      message.channel.send("There was a problem with your request. Please, try again later.");
      console.log(err);
      return false;
    };
  };
  const guild = res.data.data.guild
  // 2. Send message if config is not set yet
  if (!guild) {
    message.channel.send("Guild config is not set yet, please contact your guildmaster or officers.");
    return false;
  };

  // 3. Return guild object if config exists
  return guild;
};