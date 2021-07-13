const Discord = require('discord.js');
const axios = require('axios');
const isGuildInDB = require('../../utils/isGuildInDB');

module.exports = async (message, familyName) => {

  // 1. CHECK IF CONFIG EXPISTS
  const guildConfig = await isGuildInDB(message)
  if (!guildConfig) return;

  // if family doesn't exist, request user object by discord id first
  if (!familyName) {
    let res;
    try {
      res = await axios({
        method: 'GET',
        url: `http://localhost:3000/api/v1/users/discord/${message.author.id}`,
        data: {
          guild: guildConfig._id
        }
      });
    } catch (err) {
      message.channel.send("There was a problem with your request. Please, try again later.");
      console.log(err);
      return;
    }

    familyName = res.data.data.user.familyName;
  }

  let res;
  try {
    res = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/users/`,
      data: {
        familyName,
        guild: guildConfig._id
      }
    });

  } catch (err) {

    if (err.response.status === 404) {
      message.channel.send("This profile doesn't exist.");
      return;
    }

    message.channel.send("There was a problem with your request. Please, try again later.");
    console.log(err);
    return;

  }
  const user = res.data.data.users[0];

  const embed = new Discord.MessageEmbed()
    .setDescription(`Profile of **${user.familyName}**:`)
    .addField("AP:", user.regularAp, true)
    .addField("AAP:", user.awakeningAp, true)
    .addField("DP:", user.dp, true)
    .addField("Class:", `${user.stance} ${user.characterClass}`, true)
    .addField("Level:", `99`, false)
    .addField("Nodewar Group:", `${user.group ? user.group.name : "DEFAULT"}`, true)
    .addField("Proof:", `[Link](https://media.tenor.com/images/a1505c6e6d37aa2b7c5953741c0177dc/tenor.gif)`, true)
  //.setColor("#58de49");

  message.channel.send(embed)
}