const axios = require('axios');
const logger = require('../../logger');
const validateResponseRegex = require('../../utils/validators/validateResponseRegex');

module.exports = async (message, guildConfig, groupName, familyName) => {

  if (!groupName) {
    // ASK FOR GROUP NAME
    message.channel.send("What is the name of the group?");
    groupName = await validateResponseRegex(message, "Invalid format (Only letters, numbers and _ allowed).", /^[a-zA-Z0-9_]{0,18}$/g);
    if (groupName === "exit") return message.channel.send("Bye!");
  };

  // 1. CHECK IF GROUP EXISTS
  const groups = guildConfig.groups.filter(group => group.name === groupName.toUpperCase());
  if (!groups.length) return message.channel.send("Wrong group name.");
  const group = groups[0];

  // 2. FETCH THE GROUP MEMBERS
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

  if (familyName) {
    // CHECK IF FULL
    if(group.maxCount <= membersCount) return message.channel.send("This group is full.");

    // 3a. CALL API
    let res;
    try {
      res = await axios.patch(`${process.env.API_URL}/api/v1/groups/${group._id}/assign-one`, {
        userFamilyName: familyName
      });
    } catch (err) {
      if (err.response.status === 404) return message.channel.send("This user doesn't exist.");
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

    message.channel.send(`Assigned ${group.name} group to ${familyName}`);

  } else {
    // 3b. ASK FOR FAMILY NAMES
    message.channel.send("Provide the family names separated by commas.");
    const familyNames = await validateResponseRegex(message, "Invalid format.", /^[a-zA-Z _]+$/g);
    if (familyNames === "exit") {
      message.channel.send("Bye!");
      return;
    };

    let familyNamesArray = familyNames.split(",");
    familyNamesArray = familyNamesArray.map(family => family.trim());
  // CHECK IF ALL USERS WILL FIT
  if(group.maxCount <= membersCount) return message.channel.send("This group is full.");
  if(group.maxCount - membersCount < familyNamesArray.length) return message.channel.send(`Cannot add ${familyNamesArray.length} members, while there are only ${group.maxCount - membersCount} free slots in this group.`);

    // 3. CALL API
    let res;
    try {
      res = await axios.patch(`${process.env.API_URL}/api/v1/groups/${group._id}/assign-many`, {
        familyNames: familyNamesArray
      });
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

    message.channel.send(`Assigned ${group.name} group chosen members (if they exist).`);
  };
};