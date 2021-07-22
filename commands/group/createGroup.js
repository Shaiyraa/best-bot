const axios = require('axios');
const validateResponseRegex = require('../../utils/validators/validateResponseRegex');

module.exports = async (message, guildConfig, groupName, size) => {

  if (!groupName) {
    // 1. ASK FOR GROUP NAME
    message.channel.send("What is the name of the group?");
    groupName = await validateResponseRegex(message, "Invalid format (Only letters, numbers and _ allowed).", /^[a-zA-Z0-9_]{0,18}$/g);
    if (groupName === "exit") return message.channel.send("Bye!");
  } else {
    if(!groupName.match(/^[a-zA-Z0-9_]{0,18}$/g)) return message.channel.send("Invalid group name (Only letters, numbers and _ allowed).");
  }

  if (!size) {
    // 1. ASK FOR SIZE
    message.channel.send("What is the size of the group?");
    size = await validateResponseRegex(message, "Invalid number.", /^[1-9][0-9]?$|^100$/g);
    if (size === "exit") return message.channel.send("Bye!");

  } else {
    if(!size.match(/^[1-9][0-9]?$|^100$/g)) return message.channel.send("Invalid size.");
  }

  // 2. POST THE GROUP TO DB
  let res;
  try {
    res = await axios.post(`${process.env.API_URL}/api/v1/guilds/${guildConfig._id}/groups`, {
      name: groupName,
      maxCount: size
    });
  } catch (err) {
    console.log(err)
    if (err.response.status === 403) return message.channel.send("A group with this name already exists.");
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  // 3. SEND RESPONSE
  message.channel.send("Group created");
};