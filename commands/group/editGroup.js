const axios = require('axios');
const validateResponseRegex = require('../../utils/validators/validateResponseRegex');
const validateResponse = require('../../utils/validators/validateResponse');

module.exports = async (message, guildConfig, groupName) => {

  if (!groupName) return message.channel.send("Please, provide group name. Try ?group edit [name]");

  // 1. CHECK IF GROUP EXISTS
  let group = guildConfig.groups.filter(group => group.name === groupName.toUpperCase());
  if (!group.length) return message.channel.send("Wrong group name.");
  group = group[0];

  // 2. ASK WHAT TO UPDATE
  message.channel.send('What do you want to update (name, size)?');
  let param = await validateResponse(message, "Invalid response (name, size)", ["name", "size"]);
  if (param === "exit") return message.channel.send("Bye!");

  // 3. ASK FOR VALUE
  let value;
  switch (param) {
    case "name": {
      message.channel.send(`What is the name of the group? Current name: ${group.name}`);
      value = await validateResponseRegex(message, "Invalid format (Only letters, numbers and _ allowed).", /^[a-zA-Z0-9_]{0,18}$/g);
      if (value === "exit") return message.channel.send("Bye!");

      value = value.toUpperCase();
      break;
    };
    case "size": {
      message.channel.send(`What is the size of the group? Current size: ${group.maxCount}`);
      value = await validateResponseRegex(message, "Invalid number.", /^[1-9][0-9]?$|^100$/g);
      if (value === "exit") return message.channel.send("Bye!");

      param = "maxCount";
      break;
    };
  };

  // 4. CALL API TO UPDATE
  let res;
  try {
    res = await axios.patch(`${process.env.API_URL}/api/v1/groups/${group._id}?${param}=${value}`);
  } catch (err) {
    console.log(err)
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };


  message.channel.send("Group updated successfuly!");
};
