const Discord = require("discord.js");
const axios = require('axios');
const schedule = require('node-schedule');
const bot = require('../bot');
const sendEmbedMessage = require('./sendEmbedMessage');
const logger = require('../logger');

module.exports = async (bot, guildConfig, event, alerts) => {
  if (!alerts) {
    // 1. CALL API TO GET THE ALERTS FOR THIS EVENT
    let res;
    try {
      res = await axios.get(`${process.env.API_URL}/api/v1/alerts/`, {
        event: event._id
      });
    } catch (err) {
      logger.log({
        level: 'error',
        timestamp: Date.now(),
        commandAuthor: null,
        message: err
      });
    };

    alerts = res.data.data.alerts;
  };

  // FOR EACH ALERT THERE IS
  alerts.forEach(alert => {

    //  2. SCHEDULE THE ALERT
    schedule.scheduleJob(alert.date, async function () {
      // CALL API FOR THE EVENT
      let res;
      try {
        res = await axios.get(`${process.env.API_URL}/api/v1/events/${event._id}`);
      } catch (err) {
        logger.log({
          level: 'error',
          timestamp: Date.now(),
          commandAuthor: null,
          message: err
        });
      };

      const resEvent = res.data.data.event
      // CHECK IF ALERTS ARE ENABLED
      if (!resEvent.alerts) return;

      switch (alert.type) {
        case "undecided": {
          if (!resEvent.undecidedMembers.length) return;
          const arrayOfUndecidedTags = resEvent.undecidedMembers.map(member => `<@${member.id}>`).join(" ");
          const guild = await bot.guilds.fetch(guildConfig.id);

          const remindersChannel = await guild.channels.cache.get(resEvent.guild.remindersChannel);
          if (!remindersChannel) return guild.owner.send("Reminders channel doesn't exist anymore. Update the config, if you want the bot to function correctly.");

          const channel = await guild.channels.cache.get(resEvent.messageChannelId);
          if (!channel) return guild.owner.send("Announcement channel doesn't exist anymore. Update the config, if you want the bot to function correctly.");

          const eventMessage = await channel.messages.fetch(resEvent.messageId);

          await sendEmbedMessage(remindersChannel, "There's an event today! Sign up or Alish will slap you!", `[Link to the event](${eventMessage.url})`, arrayOfUndecidedTags);

          break;
        };
      };
    });
  });

  // 3. SCHEDULE BASE JOB SETTING EVENT TO INACTIVE
  // schedule.scheduleJob(event.date, async function () {
  //   let res;
  //   try {
  //     res = await axios.delete(`${process.env.API_URL}/api/v1/events/${event._id}`);
  //   } catch (err) {
  //     logger.log({
  //   level: 'error',
  //   timestamp: Date.now(),
  //   commandAuthor: null,
  //   message: err
  // });
  //   };
  // });
};