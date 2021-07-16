const Discord = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');
const deleteEvent = require('./deleteEvent');
const editEvent = require('./editEvent');

module.exports = async (message, guildConfig) => {

  // 1. GET ALL THE EVENTS FOR THIS GUILD
  let res;
  try {
    res = await axios.get(`${process.env.API_URL}/api/v1/events`, {
      guild: guildConfig._id
    });
  } catch (err) {
    console.log(err);
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  const events = res.data.data.events;
  if (!events.length) return message.channel.send("There are no scheduled events.");

  // 2. CREATE A MESSAGE AND LISTENER FOR EACH EVENT
  events.forEach(async event => {
    const totalMemberCount = event.undecidedMembers.length + event.yesMembers.length + event.noMembers.length;

    const embed = new Discord.MessageEmbed()
      .addField("Event:", event.type, false)
      .setDescription(event.mandatory ? "Mandatory" : "Non-mandatory")
      .addField("Date:", new Date(event.date).toLocaleDateString("en-GB"), true)
      .addField("Time:", event.hour, true)
      .addField("Details:", event.content, false)
      .addField("Signed up:", `${event.yesMembers.length}/${totalMemberCount}`, true)
      .addField("Can\'t:", `${event.noMembers.length}/${totalMemberCount}`, true)
      .addField("Undecided:", `${event.undecidedMembers.length}/${totalMemberCount}`, true)
      .setColor(event.mandatory ? "#ff0000" : "#58de49");

    // send message
    const reactionMessage = await message.channel.send(embed);

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
          await deleteEvent(message, guildConfig, event)
          break;
        };
        case config.editEmoji: {
          await editEvent(message, guildConfig, event);
          break;
        };
      };
    });
  });
};