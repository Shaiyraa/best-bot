const axios = require('axios');
const logger = require('../../logger');
const validateResponseRegex = require('../../utils/validators/validateResponseRegex');

module.exports = async (message, guildConfig, familyName) => {

  if (!familyName) {
    // ask for family
    message.channel.send("Whose PA group you want to delete?");
    familyName = await validateResponseRegex(message, "Invalid format", /^([a-zA-Z0-9][a-zA-Z_0-9]{0,25})$/g);
    if (familyName === "exit") return message.channel.send("Bye!");
  }


  // Call API to remove PA group 
  let resRemovePa;
  try {
    resRemovePa = await axios.patch(`${process.env.API_URL}/api/v1/pa-groups/remove?user=${familyName}&guild=${guildConfig._id}`);
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

  message.channel.send(`Removed PA group from **${familyName}**.`);

};