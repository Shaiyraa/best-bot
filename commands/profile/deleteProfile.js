const axios = require('axios');
const hasRole = require('../../utils/hasRole');
const deleteMemberProfileFromDB = require('../../utils/deleteMemberProfileFromDB');
const confirmation = require('../../utils/validators/confirmation');

module.exports = async (message, guildConfig, familyName) => {
  if (familyName) {
    // Check if officer
    const isOfficer = await hasRole(message, guildConfig.officerRole);
    if (!isOfficer) return message.channel.send(`Only <@&${guildConfig.officerRole}> can use this command.`, { "allowedMentions": { "users": [] } });
  }

  // 1. ASK FOR CONFIRMATION
  message.channel.send("Are you sure? Type \"yes\" to delete the profile forever!");
  const value = await confirmation(message);
  if(!value) return message.channel.send("Bye!");

  if (familyName) {
    // 2. FETCH MEMBER
    let res;
    try {
      res = await axios.get(`${process.env.API_URL}/api/v1/users?familyName=${familyName}&guild=${guildConfig._id}`);
    } catch (err) {
      console.log(err);
      return message.channel.send("There was a problem with your request. Please, try again later.")
    }

    if (!res.data.results) return message.channel.send("No user found.")
    member = res.data.data.users[0];

    await deleteMemberProfileFromDB(member.id, guildConfig._id, "admin");
  } else {
    try {
      await axios.delete(`${process.env.API_URL}/api/v1/users/discord/${message.author.id}?deletedBy=user`);
    } catch (err) {
      if(err.response.status === 404) return message.channel.send("This profile doesn't exist.")
      console.log(err);
      return message.channel.send("There was a problem with your request. Please, try again later.")
    };
  };

  message.channel.send("Profile has been deleted.");
};