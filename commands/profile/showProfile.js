const Discord = require('discord.js');
const axios = require('axios');
const logger = require('../../logger');
const isGuildInDB = require('../../utils/isGuildInDB');
const hasRole = require('../../utils/hasRole');

module.exports = async (message, guildConfig, familyName, sudo) => {

  // if family doesn't exist, request user object by discord id first
  if (!familyName) {
    let res;
    try {
      res = await axios({
        method: 'GET',
        url: `${process.env.API_URL}/api/v1/users/discord/${message.author.id}`,
        data: {
          guild: guildConfig._id
        }
      });
    } catch (err) {
      if (err.response.status === 404) return message.channel.send("This profile doesn't exist. Try ?profile create");
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

    familyName = res.data.data.user.familyName;
  }

  // 1. FIND USER
  let res;
  try {
    res = await axios({
      method: 'GET',
      url: `${process.env.API_URL}/api/v1/users?familyName=${familyName}&guild=${guildConfig._id}`
    });
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
  }

  if (!res.data.results) return message.channel.send("This profile doesn't exist.");
  const member = res.data.data.users[0];

  // 2. DISPLAY MESSAGE
  const embed = new Discord.MessageEmbed().setDescription(`Profile of **${member.familyName}**:`);

  if(sudo === "full") {
     // CHECK IF OFFICER
    const isOfficer = await hasRole(message, guildConfig.officerRole)
    if (isOfficer) member.private = false
  };

  if (!member.private) {
    embed.addField("AP:", member.regularAp, true)
      .addField("AAP:", member.awakeningAp, true)
      .addField("DP:", member.dp, true)
      .addField("Level:", member.level, true)
      .addField("Proof:", `[Link](${member.proof || "https://media.tenor.com/images/a1505c6e6d37aa2b7c5953741c0177dc/tenor.gif"})`, true);
  } else {
    embed.setFooter(":lock: Profile set to private");
  };

  embed.addField("Class:", `${member.characterClass === "shai" ? "" : member.stance} ${member.characterClass}`, false)
    .addField("Nodewar Group:", `${member.group ? member.group.name : "DEFAULT"}`, true);
  //.setColor("#58de49");

  message.channel.send(embed);
};