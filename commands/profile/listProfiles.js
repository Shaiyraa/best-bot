const axios = require('axios');
const logger = require('../../logger');
const isGuildInDB = require('../../utils/isGuildInDB');
const hasRole = require('../../utils/hasRole');

module.exports = async (message, guildConfig, sortBy, isAsc) => {

  // 2. CHECK IF OFFICER
  const isOfficer = await hasRole(message, guildConfig.officerRole)
  if (!isOfficer) return message.channel.send(`Only <@&${guildConfig.officerRole}> can use this command.`, { "allowedMentions": { "users": [] } });

  if(!sortBy) sortBy = "gearscore"
  switch(isAsc) {
    case "a":
    case "asc": {
      isAsc = true;
      break;
    };
    case "d":
    case "desc":
    case undefined: {
      isAsc = false;
      break;
    };
    default: {
      return message.channel.send("Incorrect sorting method param (options: \"asc\" or \"a\"; \"desc\" or \"d\").");
    }
  }

  switch(sortBy) {
    case "ap": {
      sortBy = "regularAp";
      break;
    };
    case "aap": {
      sortBy = "awakeningAp";
      break;
    };
    case "class": {
      sortBy = "characterClass";
      break;
    };
    case "update": {
      sortBy = "lastUpdate";
      break;
    };
    case "gearscore":
    case "dp": {
      break;
    };
    default: {
      return message.channel.send(`Can\'t sort by ${sortBy}`);
    }
  }

  // 1. CALL API FOR USERS IN THE GUILD
  let res;
  try {
    res = await axios.get(`${process.env.API_URL}/api/v1/users/?guild=${guildConfig._id}&sort=${isAsc ? "" : "-"}${sortBy}`);
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

  if (!res.data.results) return message.channel.send("There are no users to display.");

  // 2. GET REQUIRED DATA
  const users = res.data.data.users;

  let membersData = [`${"<FAMILY NAME>".padEnd(25, ' ')} ${"<AP>".toString().padEnd(5, ' ')} ${"<AAP>".toString().padEnd(5, ' ')} ${"<DP>".toString().padEnd(5, ' ')} ${"<GS>".toString().padEnd(5, ' ')} ${"<CLASS>".padEnd(16, ' ')} ${"<UPDATE>".padEnd(15, ' ')}\n`]
  users.forEach(user => {
    if(user.private !== true) {
      let date = new Date(user.lastUpdate)
      let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
      let month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
      date = `${day}-${month}-${date.getFullYear()}`;
  
      membersData.push(`${user.familyName.padEnd(25, ' ')} ${user.regularAp.toString().padEnd(5, ' ')} ${user.awakeningAp.toString().padEnd(5, ' ')} ${user.dp.toString().padEnd(5, ' ')} ${user.gearscore.toString().padEnd(5, ' ')} ${user.characterClass.padEnd(16, ' ')} ${date.padEnd(10, ' ')}\n`);
    }
  })
  users.forEach(user => {
    if(user.private === true) {  
      let date = new Date(user.lastUpdate)
      let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
      let month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
      date = `${day}-${month}-${date.getFullYear()}`;
      
      user.regularAp = "???";
      user.awakeningAp = "???";
      user.dp = "???";

      membersData.push(`${user.familyName.padEnd(25, ' ')} ${user.regularAp.toString().padEnd(5, ' ')} ${user.awakeningAp.toString().padEnd(5, ' ')} ${user.dp.toString().padEnd(5, ' ')} ${user.gearscore.toString().padEnd(5, ' ')} ${user.characterClass.padEnd(16, ' ')} ${date.padEnd(10, ' ')}\n`);
    }
  })
  
  const formattedMembersData = membersData.join('');
  message.channel.send(`\`\`\`css\n${formattedMembersData}\`\`\``).catch(err => {
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
  });
};