const axios = require('axios');

module.exports = async (message, guildConfig, event) => {

  // 1. ASK FOR CONFIRMATION
  message.channel.send("Are you sure? Type \"yes\" to delete the event forever!");
  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
    .then(async m => {
      m = m.first();
      if (m.content.toLowerCase() === "yes") {

        // 2. CALL API TO DELETE THE EVENT
        try {
          await axios.delete(`http://localhost:3000/api/v1/events/${event._id}`)
        } catch (err) {
          console.log(err);
          return message.channel.send("There was a problem with your request. Please, try again later.")
        }

        // 3. DELETE THE EVENT MESSAGE
        const channel = await message.guild.channels.resolve(guildConfig.announcementsChannel);
        let eventMessage = await channel.messages.fetch(event.messageId);
        if (eventMessage) eventMessage.delete();
        message.channel.send("Event has been deleted.");
      };
    })
    .catch((err) => {
      message.channel.send(err.response.data.message);
    });
};