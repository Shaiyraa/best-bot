const axios = require('axios');
const config = require('./config.json');
const updateEventMessage = require('./utils/updateEventMessage');
const scheduleAlertsForEvent = require('./utils/scheduleAlertsForEvent');

const setEventListenersAndScheduleAlerts = async bot => {
  // 1. GET FUTURE EVENTS FROM DB
  let res;
  try {
    res = await axios.get(`http://localhost:3000/api/v1/events?date[gte]=${Date.now()}`);
  } catch (err) {
    return console.log(err);
  };

  const events = res.data.data.events;
  if (!events.length) return

  events.forEach(async event => {
    // 2. FETCH EVENT MESSAGE
    const guild = await bot.guilds.fetch(event.guild.id)
    const channel = await guild.channels.cache.get(event.guild.announcementsChannel)
    const eventMessage = await channel.messages.fetch(event.messageId)

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
          const res = await axios.patch('http://localhost:3000/api/v1/events/change-group', {
            eventId: event._id,
            userDiscordId: user.id,
            goToGroup
          });

          await updateEventMessage(res.data.data.event, eventMessage);

        } catch (err) {
          console.log(err);

          if (err.response.status === 403) {
            user.send(err.response.data.message);
            return
          }
          if (err.response.status !== 400) {
            user.send("There was a problem with your request. Please, try again later.");
          }
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