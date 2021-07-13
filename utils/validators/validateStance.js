const Discord = require("discord.js");
const config = require("../../config.json");

module.exports = async (message) => {
  let response = "";

  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
    .then(m => {
      m = m.first();
      if (!m || m.content.startsWith(config.prefix)) {
        return "exit";
      };
      response = m.content.toLowerCase();
    })
    .catch((err) => {
      console.log(err)
      return "exit"
    });

  if (response === "succ" || response === "s") response = "succession"
  if (response === "awa" || response === "a") response = "awakening"

  if (config.stance.includes(response)) return response;

  message.channel.send("Invalid response.");
  return await validateResponse(message);
};
