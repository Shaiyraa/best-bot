const Discord = require('discord.js');
const axios = require('axios');
const isGuildInDB = require('../../utils/isGuildInDB');

module.exports = async (message) => {

  // 1. CHECK IF GUILD IS IN DB
  const guildConfig = await isGuildInDB(message);
  if (!guildConfig) return;

  // 2. CALL API FOR USERS IN THE GUILD
  let res;
  try {
    res = await axios.get("http://localhost:3000/api/v1/users/", {
      guild: guildConfig._id
    })

  } catch (err) {
    console.log(err)
    message.channel.send("There was a problem with your request. Please, try again later.");
    return;
  }

  const users = res.data.data.users

  const membersInfo = users.map(user => `${user.familyName} 650GS <${user.characterClass}>`)
  membersInfo.join('\n')

  const embed = new Discord.MessageEmbed()
    .addField("All user profiles:", membersInfo)
  message.channel.send(embed);


  // TODO: fix this shit
};