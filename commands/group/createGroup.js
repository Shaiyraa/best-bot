const axios = require('axios');
const validateResponseRegex = require('../../utils/validateResponseRegex');
const isGuildInDB = require('../../utils/isGuildInDB');

module.exports = async (message, groupName) => {

  // 1. CHECK IF GUILD IS IN DB
  const guildConfig = await isGuildInDB(message);
  if (!guildConfig) return;

  if (!groupName) {
    // 2. ASK FOR GROUP NAME
    message.channel.send("What is the name of the group?");
    groupName = await validateResponseRegex(message, "Invalid format (Only letters, numbers and _ allowed).", /^[a-zA-Z0-9_ ]{0,18}$/g);
    if (groupName === "exit") {
      message.channel.send("Bye!");
      return;
    }
  };

  // 3. POST THE GROUP TO DB
  let res;
  try {
    res = await axios.post(`http://localhost:3000/api/v1/guilds/${guildConfig._id}/groups`, {
      name: groupName
    })
  } catch (err) {
    message.channel.send(err.response.data.message);
    return console.log(err);
  };

  // 4. SEND RESPONSE
  message.channel.send("Group created");
};