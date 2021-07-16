const axios = require('axios');
const validateResponseRegex = require('../../utils/validators/validateResponseRegex');

module.exports = async (message, guildConfig, groupName) => {

  if (!groupName) {
    // 1. ASK FOR GROUP NAME
    message.channel.send("What is the name of the group?");
    groupName = await validateResponseRegex(message, "Invalid format (Only letters, numbers and _ allowed).", /^[a-zA-Z0-9_]{0,18}$/g);
    if (groupName === "exit") return message.channel.send("Bye!");
  };

  // 2. POST THE GROUP TO DB
  let res;
  try {
    res = await axios.post(`${process.env.API_URL}/api/v1/guilds/${guildConfig._id}/groups`, {
      name: groupName
    });
  } catch (err) {
    console.log(err)
    if (err.response.status === 403) return message.channel.send("A group with this name already exists.");
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  // 3. SEND RESPONSE
  message.channel.send("Group created");
};