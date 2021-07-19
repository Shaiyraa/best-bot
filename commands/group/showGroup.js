const Discord = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');
const deleteGroup = require('./deleteGroup');
const editGroup = require('./editGroup');

module.exports = async (message, guildConfig, groupName) => {
  if(!groupName) return message.channel.send("Provide a group name.");

  // 1a. SEE IF THE GROUP IS IN GUILDCONFIG
  let group = guildConfig.groups.filter(group => group.name === groupName.toUpperCase())
  group = group[0];
  if(!group) return message.channel.send("This group doesn't exist.");
  // 2b. FETCH THE GROUP
  let res;
  try {
  res = await axios.get(`${process.env.API_URL}/api/v1/guilds/${guildConfig._id}/groups/${group._id}`);
  } catch (err) {
    console.log(err);
    if(err?.response.status === 404) return message.channel.send(err.response.data.message);
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };
  const resGroup = res.data.data.group;

  // 2. FETCH THE USERS IN THE GROUP
  let resUsers;
  try {
  resUsers = await axios.get(`${process.env.API_URL}/api/v1/users?guild=${guildConfig._id}&group=${group._id}`);
  //if(!resUsers.data.results) return message.channel.send("I didn't find any users belonging to this group.");
  } catch (err) {
    console.log(err)
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };
  const members = resUsers.data.data.users;

  let memberFamilyNamesArray = "no members";
  if(members) {
    memberFamilyNamesArray = members.map(member => member.familyName).join(", ");
  }

  // 3. MAKE AN EMBED
  const embed = new Discord.MessageEmbed()
  .setTitle(`Group ${resGroup.name}:`)
  .addField("Max. size:", resGroup.maxCount)
  .addField("Members count:", resUsers.data.results)
  .addField("Members:", memberFamilyNamesArray);

  // 4. SEND MESSAGE
  const reactionMessage = await message.channel.send(embed);

  // 5. CREATE LISTENERS
  let emojis = [config.editEmoji, config.deleteEmoji];
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
        await deleteGroup(message, guildConfig, group.name);
        break;
      };

      case config.editEmoji: {
        await editGroup(message, guildConfig, group.name);
        break;
      };
    };
  });
}