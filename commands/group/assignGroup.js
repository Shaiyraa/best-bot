const axios = require('axios');
const validateResponseRegex = require('../../utils/validateResponseRegex');
const isGuildInDB = require('../../utils/isGuildInDB');

module.exports = async (message, groupName, familyName) => {

  // 1. CHECK IF GUILD IS IN DB
  const guildConfig = await isGuildInDB(message);
  if (!guildConfig) return;

  // 2. CHECK IF GROUP EXISTS
  let group = guildConfig.groups.filter(group => group.name === groupName.toUpperCase());
  if (!group.length) return message.channel.send("Wrong group name.");

  group = group[0]

  if (familyName) {
    // 3a. CALL API
    let res;

    try {
      res = await axios.patch(`http://localhost:3000/api/v1/groups/${group._id}/assign-one`, {
        userFamilyName: familyName
      });
    } catch (err) {
      message.channel.send(err.response.data.message);
      console.log(err);
    };

    message.channel.send(`Assigned ${group.name} group to ${familyName}`);

  } else {
    // 3b. ASK FOR FAMILY NAMES
    message.channel.send("Provide the family names separated by spaces:");
    const familyNames = await validateResponseRegex(message, "Invalid format.", /^[a-zA-Z _]+$/g);
    if (familyNames === "exit") {
      message.channel.send("Bye!");
      return;
    }

    const familyNamesArray = familyNames.split(" ")

    // 4. CALL API
    let res;
    try {
      res = await axios.patch(`http://localhost:3000/api/v1/groups/${group._id}/assign-many`, {
        familyNames: familyNamesArray
      });
    } catch (err) {
      message.channel.send(err.response.data.message);
      console.log(err);
    };

    message.channel.send(`Assigned ${group.name} group chosen members`);

  };
};