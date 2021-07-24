const Discord = require('discord.js');
const axios = require('axios');
const logger = require('../../logger');
const config = require('../../config.json');
const deleteEvent = require('./deleteEvent');
const showStatsForEvent = require('./showStatsForEvent');

module.exports = async (message, guildConfig, pastDate) => {

  if(pastDate) {
    if(!pastDate.match(/^(?:(?:31(\/|-|.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g)) {
      return message.channel.send("Invalid date format.");
    }
    pastDate = new Date(pastDate.split(/\D/g)[2], pastDate.split(/\D/g)[1] - 1, pastDate.split(/\D/g)[0], 23, 59);
    
    const isToday = (someDate) => {
      const today = new Date()
      return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
    }

    // check if the date is today
    isToday(pastDate) ? pastDate = Date.now() : pastDate = pastDate.getTime()

    if (pastDate > Date.now()) return message.channel.send("This date is not in the past.");

  } else {
    pastDate = Date.now();
  };
  
  // 1. GET ALL THE EVENTS FOR THIS GUILD
  let res;
  try {
    res = await axios.get(`${process.env.API_URL}/api/v1/events?date[lte]=${pastDate}&sort=date`, {
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
  if (!res.data.results) return message.channel.send("There are no past events to display.");

  // 2. CREATE A MESSAGE AND LISTENER FOR EACH EVENT
  events.forEach(async event => {
    const totalMemberCount = event.undecidedMembers.length + event.yesMembers.length + event.noMembers.length;

    const date = new Date(event.date)
    const embed = new Discord.MessageEmbed()
      .addField("Event:", event.type, true)
      .setDescription(event.mandatory ? "Mandatory" : "Non-mandatory")
      .addField("Date:", `<t:${date.getTime() / 1000}>`, true)
      .addField("Ended:", `<t:${date.getTime() / 1000}:R>`, true)
      .setColor(event.mandatory ? "#ff0000" : "#58de49");

    // send message
    const reactionMessage = await message.channel.send(embed);

    // set emojis
    let emojis = [config.statsEmoji, config.deleteEmoji];
    await reactionMessage.react(config.statsEmoji);
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
        case config.statsEmoji: {
          await showStatsForEvent(message, guildConfig, event);
          break;
        };
      };
    });
  });
}
