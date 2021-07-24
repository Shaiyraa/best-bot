const axios = require('axios');
const logger = require('../../logger');
const confirmation = require('../../utils/validators/confirmation');

module.exports = async (message, guildConfig, event) => {

  // 1. ASK FOR CONFIRMATION
  message.channel.send("Are you sure? Type \"yes\" to delete the event forever!");
  const value = await confirmation(message);
  if(!value) return message.channel.send("Bye!");

  // 2. CALL API TO DELETE THE EVENT
  try {
    await axios.delete(`${process.env.API_URL}/api/v1/events/${event._id}`)
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
    return message.channel.send("There was a problem with your request. Please, try again later.")
  }

  // 3. DELETE THE EVENT MESSAGE
  const channel = await message.guild.channels.resolve(guildConfig.announcementsChannel)
  if (!channel) return message.channel.send("Event has been deleted, but announcements channel doesn't exist. Please, update the config, so the bot can function properly.");
  let eventMessage = await channel.messages.fetch(event.messageId);
  if (eventMessage) eventMessage.delete();
  message.channel.send("Event has been deleted.");

};