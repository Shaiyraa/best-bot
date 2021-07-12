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

  const familyNames = users.map(user => user.familyName)
  const gs = users.map(user => 650) // TODO: count GS in virtual property in db
  const characterClasses = users.map(user => user.characterClass)

  const embed = new Discord.MessageEmbed()
    .setTitle("All user profiles:")
    .addField("Family Name", familyNames, true)
    .addField("GS", gs, true)
    .addField("Class", characterClasses, true)

  message.channel.send(embed);
};