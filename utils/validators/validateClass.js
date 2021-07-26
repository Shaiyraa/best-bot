const logger = require('../../logger');
const config = require("../../config.json");

const validateClass = async (message) => {
  let response = "";

  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
    .then(m => {
      m = m.first();
      if (!m || m.content.startsWith(config.prefix)) {
        response = "exit";
      } else if (m.content.toLowerCase() === "exit") {
        response = "exit";
      } else {
        response = m.content.toLowerCase();
      };
    })
    .catch((err) => {
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
      response = "exit"
    });

  if (response === "zerk" || response === "zerker") response = "berserker";
  if (response === "dk" || response === "darkknight") response = "dark knight";
  if (response === "guard") response = "guardian";
  if (response === "hash") response = "hashashin";
  if (response === "kuno") response = "kunoichi";
  if (response === "mae") response = "maehwa";
  if (response === "sorc") response = "sorceress";
  if (response === "valk") response = "valkyrie";
  if (response === "warr") response = "warrior";
  if (response === "cors") response = "corsair";

  if (config.classes.includes(response) || response === "exit") {
    return response;
  };
 
  message.channel.send("This class doesn't exist");
  return await validateClass(message);
};

module.exports = validateClass;
