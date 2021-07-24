const Discord = require('discord.js');
const axios = require('axios');
const logger = require('../../logger');
const config = require('../../config.json');
const deleteEvent = require('./deleteEvent');
const editEvent = require('./editEvent');

module.exports = async (message, guildConfig) => {

  // 1. GET ALL THE EVENTS FOR THIS GUILD
  let res;
  try {
    res = await axios.get(`${process.env.API_URL}/api/v1/events?date[gte]=${Date.now()}`, {
      guild: guildConfig._id
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
  };

  const events = res.data.data.events;
  if (!res.data.results) return message.channel.send("There are no scheduled events.");

  // 2. CREATE A MESSAGE AND LISTENER FOR EACH EVENT
  events.forEach(async event => {
    const totalMemberCount = event.undecidedMembers.length + event.yesMembers.length + event.noMembers.length;

    const date = new Date(event.date)
    const embed = new Discord.MessageEmbed()
      .addField("Event:", event.type, true)
      .setDescription(event.mandatory ? "Mandatory" : "Non-mandatory")
      .addField("Date:", `<t:${date.getTime() / 1000}>`, true)
      .addField("Starts in:", `<t:${date.getTime() / 1000}:R>`, true)
      //.addField("Time:", event.hour, true)
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

      return (emojis.includes(reaction.emoji.name) && (user.id === message.author.id))
    };

    const collector = reactionMessage.createReactionCollector(filter, { max: 1, dispose: true });
    collector.on('collect', async (reaction, user) => {

      switch (reaction.emoji.name) {
        case config.deleteEmoji: {
          await deleteEvent(message, guildConfig, event);
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