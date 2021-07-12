const axios = require('axios');

module.exports = async (message, guildConfig, event) => {

  message.channel.send("Are you sure? Type \"yes\" to delete the event forever!");

  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
    .then(async m => {
      m = m.first();
      if (m.content.toLowerCase() === "yes") {

        // call api to delete event
        try {
          await axios.delete(`http://localhost:3000/api/v1/events/${event._id}`)
        } catch (err) {

          message.channel.send("There was a problem with your request. Please, try again later.")
          console.log(err);

        }

        // delete the reaction message
        const channel = await message.guild.channels.resolve(guildConfig.announcementsChannel);
        let eventMessage = await channel.messages.fetch(event.messageId);
        if (eventMessage) eventMessage.delete();
        message.channel.send("Event has been deleted.");

      };
    })
    .catch((err) => {
      console.log(err);
    });
};