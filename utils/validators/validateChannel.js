const config = require('../../config.json');

module.exports = async (message, errMessage) => {
  let response = "";

  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
    .then(m => {
      m = m.first();
      if (!m || m.content.startsWith(config.prefix)) {
        return response = "exit";
      };
      response = m.content;
    })
    .catch((err) => {
      response = "exit";
      console.log(err);
    });

  if (response === "exit") return response;

  response = response.replace(/([<>&#])+/g, "");
  if (message.guild.channels.cache.get(response)) return response;

  if (response !== "exit") message.channel.send(errMessage);
  return await validateResponseChannel(errMessage);
}