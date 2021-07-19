const config = require("../../config.json");

const validateContent = async (message) => {
  let response = "";

  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
    .then(m => {
      m = m.first();
      if (!m || m.content.startsWith(config.prefix)) {
        return response = "exit";
      } else if (m.content.toLowerCase() === "exit") {
        return response = "exit";
      };
      response = m.content;
    })
    .catch((err) => {
      response = "exit";
      console.log(err);
    });

  if (response.length <= 1024 && response.length > 0 || response === "exit") {
    return response;
  };

  message.channel.send("Your message is too long (max. 1024 characters allowed) or the format is invalid!");
  return await validateContent(message);
};

module.exports = validateContent;