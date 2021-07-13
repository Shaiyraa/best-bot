const Discord = require('discord.js');
const axios = require('axios');
const isGuildInDB = require('../../utils/isGuildInDB');

module.exports = async (message, guildConfig) => {

  // 1. CALL API FOR USERS IN THE GUILD
  let res;
  try {
    res = await axios.get("http://localhost:3000/api/v1/users/", {
      guild: guildConfig._id
    });
  } catch (err) {
    console.log(err)
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  // 2. GET REQUIRED DATA
  const users = res.data.data.users;
  const membersFamily = users.map(user => user.familyName);
  const membersGs = users.map(user => user.gearscore);
  const membersClasses = users.map(user => user.characterClass);

  // 3. SEND EMBED
  const embed = new Discord.MessageEmbed()
    .setTitle("All user profiles:")
    .addField("Family", membersFamily, true)
    .addField("GS", membersGs, true)
    .addField("Class", membersClasses, true);

  message.channel.send(embed);
};