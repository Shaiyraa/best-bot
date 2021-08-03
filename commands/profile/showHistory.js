const Discord = require('discord.js');
const axios = require('axios');
const logger = require('../../logger');

module.exports = async (message, guildConfig, familyName, sudo) => {
  // 1. GET USER 

  let member
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
      if (err.response?.status === 404) return message.channel.send("This profile doesn't exist. Try ?profile create");
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

    member = res.data.data.user;
  } else {
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
    member = res.data.data.users[0];
  }

  // 2. CHECK IF PRIVATE
  if (sudo === "full") {
    // CHECK IF OFFICER
    const isOfficer = await hasRole(message, guildConfig.officerRole)
    if (isOfficer) member.private = false
  };

  if (member.private) return message.channel.send("This profile is private.")

  // 3. GET USERS HISTORY FROM DB
  let res;
  try {
    res = await axios.get(`${process.env.API_URL}/api/v1/user-changes?user=${member._id}&limit=10`)

    if (!res.data.results) return message.channel.send("No updates were made on this profile yet.")
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

  let updates = res.data.data.userChanges;
  // 4. DISPLAY THE DATA
  let formattedUpdatesArray = [`${"<DATE>".padEnd(13, " ")} ${"<FIELD>".padEnd(10, " ")} ${"<OLD>".padEnd(7, " ")} ${"<NEW>".padEnd(7, " ")}\n`]

  updates.forEach(update => {
    let date = new Date(update.timestamp)
    let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    let month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    date = `${day}-${month}-${date.getFullYear()}`;

    formattedUpdatesArray.push(`${date.padEnd(13, " ")} ${update.changedField.padEnd(10, " ")} ${update.oldValue.toString().padEnd(7, " ")} ${update.newValue.toString().padEnd(7, " ")}\n`)
  })

  const embed = new Discord.MessageEmbed()
    .setTitle(`Profile updates for ${member.familyName}:`)
    .setDescription(`\`\`\`css\n${formattedUpdatesArray.join("")}\`\`\``)

  message.channel.send(embed)
}