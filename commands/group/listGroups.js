const Discord = require('discord.js');
const axios = require('axios');
const editGroup = require('./editGroup');
const deleteGroup = require('./deleteGroup');
const config = require('../../config.json');
module.exports = async (message, guildConfig) => {

  // 1. GET ALL USERS FROM THE GUILD
  let res;
  try {
    res = await axios.get(`http://localhost:3000/api/v1/users?guild=${guildConfig._id}`)
  } catch (err) {
    console.log(err);
    return messge.channel.send(err.response.data.message);
  };
  const users = res.data.data.users;
  // 2. GET ALL THE GROUPS FOR THIS GUILD

  const groups = guildConfig.groups;

  groups.forEach(async group => {
    // 3. GET ALL USERS FROM THE GROUP
    let count = 0;
    users.filter(member => {
      if (member.group?.name === group.name) count++
    });

    // 4. DISPLAY EMBED WITH NAME AND NUMBER OF PPL IN THE GROUP
    const embed = new Discord.MessageEmbed()
      .addField("Name:", group.name, false)
      .addField("Members:", count, false)
      .addField("Max. Size:", group.maxCount, false)

    const reactionMessage = await message.channel.send(embed);

    // 5. CREATE LISTENER TO UPDATE AND DELETE GROUP
    // set emojis
    let emojis = [config.editEmoji, config.deleteEmoji];
    await reactionMessage.react(config.editEmoji);
    await reactionMessage.react(config.deleteEmoji);

    const filter = (reaction, user) => {
      if (!emojis.includes(reaction.emoji.name)) {
        let reactionMap = reactionMessage.reactions.resolve(reaction.emoji.id) || reactionMessage.reactions.resolve(reaction.emoji.name);
        reactionMap?.users.remove(user.id);
      };
      return emojis.includes(reaction.emoji.name);
    };

    const collector = reactionMessage.createReactionCollector(filter, { max: 1, dispose: true });
    collector.on('collect', async (reaction, user) => {

      switch (reaction.emoji.name) {
        case config.deleteEmoji: {
          await deleteGroup(message, guildConfig, group.name)
          break;
        };

        case config.editEmoji: {
          await editGroup(message, guildConfig, group.name)
          break;
        };
      };
    });

  })
};

