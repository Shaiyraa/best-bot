const axios = require('axios');
const validateResponseRegex = require('../../utils/validators/validateResponseRegex');

module.exports = async (message, guildConfig, groupName, familyName) => {

  // 1. CHECK IF GROUP EXISTS
  let group = guildConfig.groups.filter(group => group.name === groupName.toUpperCase());
  if (!group.length) return message.channel.send("Wrong group name.");
  group = group[0];

  if (familyName) {

    // 2a. CALL API
    let res;
    try {
      res = await axios.patch(`http://localhost:3000/api/v1/groups/${group._id}/assign-one`, {
        userFamilyName: familyName
      });
    } catch (err) {
      console.log(err);
      return message.channel.send(err.response.data.message);
    };

    message.channel.send(`Assigned ${group.name} group to ${familyName}`);

  } else {

    // 2b. ASK FOR FAMILY NAMES
    message.channel.send("Provide the family names separated by spaces:");
    const familyNames = await validateResponseRegex(message, "Invalid format.", /^[a-zA-Z _]+$/g);
    if (familyNames === "exit") {
      message.channel.send("Bye!");
      return;
    };

    const familyNamesArray = familyNames.split(" ");

    // 3. CALL API
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