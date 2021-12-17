const axios = require('axios');
const logger = require('../../logger');
const updateEventMessage = require("../../utils/updateEventMessage");
const validateContent = require("../../utils/validators/validateContent");
const validateResponse = require("../../utils/validators/validateResponse");
const validateResponseRegex = require("../../utils/validators/validateResponseRegex");

module.exports = async (message, guildConfig, event) => {

  // ask for param
  message.channel.send('What do you want to update (type, attendance, mandatory, alerts, description)?');
  let param = await validateResponse(message, "Invalid response (options: type, attendance, mandatory, alerts, description)", ["type", "attendance", "mandatory", "alerts", "description"]);
  if (param === "exit") return message.channel.send("Bye!");

  // ask for value
  let value;
  switch (param) {
    case "type": {
      message.channel.send(`What is the type of the event? Current type: ${event.type}. Possible types: "nodewar", "siege", "guildevent"`);
      value = await validateResponse(message, "Invalid response (nodewar, siege, guildevent)", ["nodewar", "siege", "guildevent"]);
      if (value === "exit") return message.channel.send("Bye!");

      break;
    };
    case "attendance": {
      message.channel.send('What is the max amount of people (1-100)?');
      value = await validateResponseRegex(message, "Invalid number.", /^[1-9][0-9]?$|^100$/g);
      if (value === "exit") return message.channel.send("Bye!");

      // 1. check how many yesMembers there is
      let resMembers;
      try {
        resMembers = await axios.get(`${process.env.API_URL}/api/v1/events/${event._id}`);
      } catch {
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
        return message.channel.send("There was a problem with your request. Please, try again later.");
      }

      // 2. compare value with yesArray to see if cap is possible
      const yesMembers = resMembers.data.data.event.yesMembers;
      if (value < yesMembers.length) return message.channel.send(`You can\`t set a cap smaller than current signups count (${yesMembers.length})!`);
      param = "maxCount";

      break;
    };
    case "mandatory": {
      value = !event.mandatory;

      break;
    };
    case "alerts": {
      value = !event.alerts;

      break;
    };
    case "description": {
      message.channel.send('Do you want to create a custom message (yes/no)? Type "next", to skip and leave previous value.');
      const contentResponse = await validateResponse(message, "Invalid answer (Valid options: yes/no).", ["yes", "no"]);

      switch (contentResponse) {
        case "exit": {
          return message.channel.send("Bye!");
        };
        case "yes": {
          message.channel.send("Type in the content (max. 1024 characters allowed):");
          value = await validateContent(message);
          break;
        };
        default: {
          value = guildConfig.defaultEventMessage;
        };
      };

      param = "content";
      break;
    };
  }

  // 2. CALL API
  let res;
  try {
    res = await axios.patch(`${process.env.API_URL}/api/v1/events/${event._id}?${param}=${value}`);
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
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  // 3. UPDATE MESSAGE
  const channel = await message.guild.channels.resolve(event.messageChannelId)
  if (!channel) return message.channel.send("You cannot modify this event's details.");
  //if (!channel) return message.channel.send("Announcements channel doesn't exist. Please, update the config, if you want the bot to function properly.");

  let eventMessage
  try {
    eventMessage = await channel.messages.fetch(event.messageId);
  } catch (err) {
    return message.channel.send("There was a problem with your request, as event message no longer exists.");
  }

  await updateEventMessage(res.data.data.event, eventMessage);
  message.channel.send("Event updated successfully!");
};

