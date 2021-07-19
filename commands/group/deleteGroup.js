

const axios = require('axios');
const confirmation = require('../../utils/validators/confirmation');

module.exports = async (message, guildConfig, groupName) => {
  if (!groupName) return message.channel.send("Please, specify the group name. Try ?group delete [group name]");

  // 1. CHECK IF GROUP EXISTS
  const groups = guildConfig.groups.filter(group => group.name === groupName.toUpperCase());
  if (!groups.length) return message.channel.send("Wrong group name.");
  const group = groups[0];

  // 2. CONFIRM DECISION
  message.channel.send(`Are you sure that you want to delete ${group.name}? Type "yes" to confirm.`);
  const value = await confirmation(message);
  if(!value) return message.channel.send("Bye!");

  // 3. CALL API
  let res;
  try {
    res = await axios.delete(`${process.env.API_URL}/api/v1/groups/${group._id}`);
  } catch (err) {
    console.log(err)
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  message.channel.send("Group has been deleted");
};
