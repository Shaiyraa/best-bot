

const axios = require('axios');
const logger = require('../../logger');
const confirmation = require('../../utils/validators/confirmation');

module.exports = async (message, guildConfig, groupName) => {
  if (!groupName) return message.channel.send("Please, specify the PA group name. Try ?pa delete [pa group name]");

  // 1. CHECK IF GROUP EXISTS
  const paGroups = guildConfig.paGroups.filter(group => group.name === groupName.toUpperCase());
  if (!paGroups.length) return message.channel.send("Invalid PA group name.");
  const paGroup = paGroups[0];
  console.log(paGroups)
  // 2. CONFIRM DECISION
  message.channel.send(`Are you sure that you want to delete ${paGroup.name}? Type "yes" to confirm.`);
  const value = await confirmation(message);
  if (!value) return message.channel.send("Bye!");

  // 3. CALL API
  let res;
  try {
    res = await axios.delete(`${process.env.API_URL}/api/v1/pa-groups/${paGroup._id}`);
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

  message.channel.send("PA group has been deleted.");
};
