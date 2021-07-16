const axios = require('axios');
const hasRole = require('../../utils/hasRole');
const deleteMemberProfileFromDB = require('../../utils/deleteMemberProfileFromDB');

module.exports = async (message, guildConfig, familyName) => {
  if (familyName) {
    // Check if officer
    const isOfficer = await hasRole(message, guildConfig.officerRole);
    if (!isOfficer) return message.channel.send(`Only <@&${guildConfig.officerRole}> can use this command.`, { "allowedMentions": { "users": [] } });
  }

  // 1. ASK FOR CONFIRMATION
  message.channel.send("Are you sure? Type \"yes\" to delete the profile forever!");
  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
    .then(async m => {
      m = m.first();
      if (m.content.toLowerCase() === "yes") {

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
            console.log(err);
            return message.channel.send("There was a problem with your request. Please, try again later.")
          };
        };

        message.channel.send("Profile has been deleted.");
      };
    })
    .catch((err) => {
      console.log(err)
      return message.channel.send("There was a problem with your request. Please, try again later.");
    });
};