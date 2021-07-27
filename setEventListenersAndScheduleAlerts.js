const axios = require('axios');
const logger = require('./logger');
const config = require('./config.json');
const updateEventMessage = require('./utils/updateEventMessage');
const scheduleAlertsForEvent = require('./utils/scheduleAlertsForEvent');

const setEventListenersAndScheduleAlerts = async bot => {
  // 1. GET FUTURE EVENTS FROM DB
  let res;
  try {
    res = await axios.get(`${process.env.API_URL}/api/v1/events?date[gte]=${Date.now()}`);
  } catch (err) {
    return logger.log({
      level: 'error',
      timestamp: Date.now(),
      commandAuthor: null,
      message: err
    });
  };

  const events = res.data.data.events;
  if (!events.length) return

  events.forEach(async event => {
    // 2a. FETCH EVENT MESSAGE
    // check if guild config exists
    if (!event.guild) return;
    const guild = await bot.guilds.fetch(event.guild.id).catch(err => console.log("no access"))
    if (!guild) return;
    const channel = await guild.channels.cache.get(event.guild.announcementsChannel);
    if (!channel) {
      const members = await guild.members.fetch()
      const owner = await guild.members.cache.get(guild.ownerID)
      return owner.send("Announcement channel doesn't exist anymore. Update the config, if you want the bot to function correctly.");
    }
    let eventMessage = await channel.messages.fetch(event.messageId);

    // 2b. IF MESSAGE DOESN'T EXIST, CREATE ONE
    if (!eventMessage) {
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

      eventMessage = await channel.send(embed);
      await updateEventMessage(event, eventMessage)
    }

    // 3. SET LISTENER
    const filter = (reaction, user) => {
      let emojis = [config.yesEmoji, config.noEmoji]

      if (!emojis.includes(reaction.emoji.name)) {
        let reactionMap = eventMessage.reactions.resolve(reaction.emoji.id) || eventMessage.reactions.resolve(reaction.emoji.name);
        reactionMap?.remove(user.id);
      }
      return emojis.includes(reaction.emoji.name);
    }

    const collector = eventMessage.createReactionCollector(filter, { dispose: true });
    collector.on('collect', async (reaction, user) => {

      const handleChangeGroup = async (goToGroup) => {
        try {
          const res = await axios.patch(`${process.env.API_URL}/api/v1/events/change-group`, {
            eventId: event._id,
            userDiscordId: user.id,
            goToGroup
          });

          await updateEventMessage(res.data.data.event, eventMessage);

        } catch (err) {
          if (err?.response?.status === 403) return user.send("You do not have permission to react or signups are closed.");
          if (err?.response?.status === 400) return user.send("You already reacted with this icon!");

          logger.log({
            level: 'error',
            timestamp: Date.now(),
            commandAuthor: null,
            message: err
          });

          return user.send("There was a problem with your request. Please, try again later.");

        };
      };

      switch (reaction.emoji.name) {
        case config.yesEmoji: {
          await handleChangeGroup("yes");
          break;
        };
        case config.noEmoji: {
          await handleChangeGroup("no");
          break;
        };
      };

      let reactionMap = eventMessage.reactions.resolve(reaction.emoji.name);
      reactionMap?.users.remove(user.id);

    });

    // 4. SCHEDULE ALERTS
    await scheduleAlertsForEvent(bot, event.guild, event);

  })
};

module.exports = setEventListenersAndScheduleAlerts;