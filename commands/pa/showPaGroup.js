const Discord = require('discord.js');
const axios = require('axios');
const deletePaGroup = require('./deletePaGroup');
const editPaGroup = require('./editPaGroup');
const logger = require('../../logger');
const config = require('../../config.json');

module.exports = async (message, guildConfig, groupName) => {
  if (!groupName) return message.channel.send("Provide a group name.");

  // 1a. SEE IF THE GROUP IS IN GUILDCONFIG
  const paGroups = guildConfig.paGroups.filter(group => group.name === groupName.toUpperCase())
  const paGroup = paGroups[0];
  if (!paGroup) return message.channel.send("This group doesn't exist.");

  // 2b. FETCH THE GROUP
  let res;
  try {
    res = await axios.get(`${process.env.API_URL}/api/v1/guilds/${guildConfig._id}/pa-groups/${paGroup._id}`);
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
    if (err?.response.status === 404) return message.channel.send(err.response.data.message);
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };
  const resGroup = res.data.data.paGroup;

  // 2. FETCH THE USERS IN THE GROUP
  let resUsers;
  try {
    resUsers = await axios.get(`${process.env.API_URL}/api/v1/users?guild=${guildConfig._id}&paGroup=${paGroup._id}`);
    //if(!resUsers.data.results) return message.channel.send("I didn't find any users belonging to this group.");
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
  const members = resUsers.data.data.users;

  let memberFamilyNamesArray = "no members";
  if (resUsers.data.results) {
    memberFamilyNamesArray = members.map(member => member.familyName).join(", ");
  }

  // 3. MAKE AN EMBED
  const embed = new Discord.MessageEmbed()
    .setTitle(`Group ${resGroup.name}:`)
    .addField("Max. size:", resGroup.maxCount)
    .addField("Members count:", resUsers.data.results)
    .addField("Members:", memberFamilyNamesArray)
    .setFooter("Click member icon to see more details about members in this group.");

  // 4. SEND MESSAGE
  const reactionMessage = await message.channel.send(embed);

  // 5. CREATE LISTENERS
  let emojis = [config.editEmoji, config.deleteEmoji, config.statsPeopleEmoji];
  await reactionMessage.react(config.statsPeopleEmoji);
  await reactionMessage.react(config.editEmoji);
  await reactionMessage.react(config.deleteEmoji);

  const filter = (reaction, user) => {
    if (!emojis.includes(reaction.emoji.name)) {
      let reactionMap = reactionMessage.reactions.resolve(reaction.emoji.id) || reactionMessage.reactions.resolve(reaction.emoji.name);
      reactionMap?.users.remove(user.id);
    };
    return (emojis.includes(reaction.emoji.name) && (user.id === message.author.id));
  };

  const collector = reactionMessage.createReactionCollector(filter, { max: 1, dispose: true });
  collector.on('collect', async (reaction, user) => {

    switch (reaction.emoji.name) {
      case config.deleteEmoji: {
        await deletePaGroup(message, guildConfig, paGroup.name);
        break;
      };

      case config.editEmoji: {
        await editPaGroup(message, guildConfig, paGroup.name);
        break;
      };

      case config.statsPeopleEmoji: {
        if (!resUsers.data.results) return message.channel.send("There are no users to display.")

        // get ppl in group
        let resUsersStats;
        try {
          resUsersStats = await axios.get(`${process.env.API_URL}/api/v1/users?guild=${guildConfig._id}&paGroup=${paGroup._id}&sort=gearscore`);
          if (!resUsersStats.data.results) return message.channel.send("No users belonging to this PA group found.");
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
        const members = resUsersStats.data.data.users;

        // count the stats
        let membersData = [`${"<FAMILY NAME>".padEnd(25, ' ')} ${"<AP>".toString().padEnd(5, ' ')} ${"<AAP>".toString().padEnd(5, ' ')} ${"<DP>".toString().padEnd(5, ' ')} ${"<GS>".toString().padEnd(5, ' ')} ${"<CLASS>".padEnd(16, ' ')} ${"<UPDATE>".padEnd(15, ' ')}\n`]

        members.forEach(member => {
          let date = new Date(member.lastUpdate)
          let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
          let month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
          date = `${day}-${month}-${date.getFullYear()}`;

          membersData.push(`${member.familyName.padEnd(25, ' ')} ${member.regularAp.toString().padEnd(5, ' ')} ${member.awakeningAp.toString().padEnd(5, ' ')} ${member.dp.toString().padEnd(5, ' ')} ${member.gearscore.toString().padEnd(5, ' ')} ${member.characterClass.padEnd(16, ' ')} ${date.padEnd(10, ' ')}\n`);
        })

        const formattedMembersData = membersData.join('');
        message.channel.send(`\`\`\`css\n${formattedMembersData}\`\`\``);
        break;
      };
    };
  });
}