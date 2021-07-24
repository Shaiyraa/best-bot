const axios = require('axios');
const logger = require('../../logger');
const validateResponseRegex = require('../../utils/validators/validateResponseRegex');
const validateResponse = require('../../utils/validators/validateResponse');

module.exports = async (message, guildConfig, groupName, param, value) => {

  if (!groupName) return message.channel.send("Please, provide group name. Try ?group edit [name]");

  // 1. CHECK IF GROUP EXISTS
  let group = guildConfig.groups.filter(group => group.name === groupName.toUpperCase());
  if (!group.length) return message.channel.send("Wrong group name.");
  group = group[0];

  if(!param) {
    // 2. ASK WHAT TO UPDATE
    message.channel.send('What do you want to update (name, size)?');
    param = await validateResponse(message, "Invalid response (name, size)", ["name", "size"]);
    if (param === "exit") return message.channel.send("Bye!");
  } 

  // 3. ASK FOR VALUE
  switch (param) {
    case "name": {
      if(!value) {
        message.channel.send(`What is the name of the group? Current name: ${group.name}`);
        value = await validateResponseRegex(message, "Invalid format (only letters, numbers and _ allowed).", /^([a-zA-Z][a-zA-Z_]{0,18})$/g);
        if (value === "exit") return message.channel.send("Bye!");
      } else {
        if(!value.match(/^([a-zA-Z][a-zA-Z_]{0,18})$/g)) return message.channel.send("Invalid format (only letters, numbers and _ allowed).");
      }

      value = value.toUpperCase();
      break;
    };
    case "size": {
      if(!value) {
        message.channel.send(`What is the size of the group? Current size: ${group.maxCount}`);
        value = await validateResponseRegex(message, "Invalid number.", /^[1-9][0-9]?$|^100$/g);
        if (value === "exit") return message.channel.send("Bye!");
      } else {
        if (!value.match(/^[1-9][0-9]?$|^100$/g)) return message.channel.send("Invalid number.");
      }
      
      // FETCH MEMBERS AND CHECK IF VALUE IS LOWER THAN THEIR COUNT
      let resUsers;
      try {
      resUsers = await axios.get(`${process.env.API_URL}/api/v1/users?guild=${guildConfig._id}&group=${group._id}`);
      } catch (err) {
        logger.log({
          level: 'error',
          timestamp: Date.now(),
          commandAuthor: {
            id: message.author.id,
            username: message.author.username,
            tag: message.author.tag
          },
          message: err
        });
        return message.channel.send("There was a problem with your request. Please, try again later.");
      };
      const membersCount = resUsers.data.results;
      if(value < membersCount) return message.channel.send("You can\'t set size smaller than current members count!")

      param = "maxCount";
      break;
    };
    default: {
      return message.channel.send(`Can\'t update ${param}`);
    }
  };

  // 4. CALL API TO UPDATE
  let res;
  try {
    res = await axios.patch(`${process.env.API_URL}/api/v1/groups/${group._id}?${param}=${value}`);
  } catch (err) {
    logger.log({
      level: 'error',
      timestamp: Date.now(),
      commandAuthor: {
        id: message.author.id,
        username: message.author.username,
        tag: message.author.tag
      },
      message: err
    });
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };


  message.channel.send("Group updated successfuly!");
};
