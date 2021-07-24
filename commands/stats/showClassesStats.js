const Discord = require("discord.js");
const axios = require('axios');
const logger = require('../../logger');
const config = require('../../config.json');

module.exports = async (message, guildConfig, groupName) => {
  let members;
  if(groupName) {
    // 1. find the id of the group looping through guildconfig.groups
    const groups = guildConfig.groups.filter(group => group.name === groupName.toUpperCase())
    const group = groups[0]
    if(!group) return message.channel.send("This group doesn't exist.");
    // 2. find users with the role id
    let resUsers;
    try {
    resUsers = await axios.get(`${process.env.API_URL}/api/v1/users?guild=${guildConfig._id}&group=${group._id}`);
    if(!resUsers.data.results) return message.channel.send("No users belonging to this group found.");
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
    };
    members = resUsers.data.data.users;

  } else {
     // find all users within the guild
     let resUsers;
    try {
    resUsers = await axios.get(`${process.env.API_URL}/api/v1/users?guild=${guildConfig._id}`);
    if(!resUsers.data.results) return message.channel.send("No users belonging to this group found.");
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
    };
    members = resUsers.data.data.users;
  }

  // 1. GET CLASSES
  let classes = {
  };

  members.forEach(member => {
    if(classes[member.characterClass]) {
      classes[member.characterClass].count = classes[member.characterClass].count + 1;
      classes[member.characterClass].apSum = classes[member.characterClass].apSum + member.regularAp;
      classes[member.characterClass].aapSum = classes[member.characterClass].aapSum + member.awakeningAp;
      classes[member.characterClass].dpSum = classes[member.characterClass].dpSum + member.dp;
      classes[member.characterClass].gsSum = classes[member.characterClass].gsSum + member.gearscore;
    } else {
      classes[member.characterClass] = {
        count: 1,
        apSum: member.regularAp,
        aapSum: member.awakeningAp,
        dpSum: member.dp,
        gsSum: member.gearscore
      };
    };
  })
//classes[characterClass]
  let classesArray = [`${"<CLASS>".padEnd(12, ' ')} ${"<COUNT>".padEnd(7, ' ')} ${"<AP>".padEnd(5, ' ')} ${"<AAP>".padEnd(5, ' ')} ${"<DP>".padEnd(5, ' ')} ${"<GS>".padEnd(5, ' ')}\n`]
  config.classes.forEach(characterClass => {
    let count = classes[characterClass] ? classes[characterClass].count : 0;
    let ap = classes[characterClass] ? Math.floor(classes[characterClass].apSum / count) : 0;
    let aap = classes[characterClass] ? Math.floor(classes[characterClass].aapSum / count) : 0;
    let dp = classes[characterClass] ? Math.floor(classes[characterClass].dpSum / count) : 0;
    let gs = classes[characterClass] ? Math.floor(classes[characterClass].gsSum / count) : 0;

    classesArray.push(`${characterClass.padEnd(12, ' ')} ${count.toString().padEnd(7, ' ')} ${ap.toString().padEnd(5, ' ')} ${aap.toString().padEnd(5, ' ')} ${dp.toString().padEnd(5, ' ')} ${gs.toString().padEnd(5, ' ')}\n`)
  });

  // coNst embed = new Discord.MessageEmbed()
  //   .setTitle(groupName ? `Stats for ${groupName.toUpperCase()} group` : "Stats for the entire guild")
  //   .setDescription("CLASSES:")
  //   .setColor("RANDOM")

  message.channel.send(groupName ? `Stats for ${groupName.toUpperCase()} group:` : "Stats for the entire guild:");
  message.channel.send(`\`\`\`css\n${classesArray.join("")}\`\`\``);
}