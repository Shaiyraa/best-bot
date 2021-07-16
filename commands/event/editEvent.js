const axios = require('axios');
const updateEventMessage = require("../../utils/updateEventMessage");
const validateContent = require("../../utils/validators/validateContent");
const validateResponse = require("../../utils/validators/validateResponse");
const validateResponseRegex = require("../../utils/validators/validateResponseRegex");

module.exports = async (message, guildConfig, event) => {

  // ask for param
  message.channel.send('What do you want to update (type, mandatory, alerts, description)?');
  let param = await validateResponse(message, "Invalid response (options: type, mandatory, alerts, description)", ["type", "mandatory", "alerts", "description"]);
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

      break;
    };
  }

  // 2. CALL API

  let res;
  try {
    res = await axios.patch(`http://localhost:3000/api/v1/events/${event._id}?${param}=${value}`);
  } catch (err) {
    console.log(err);
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  // 3. UPDATE MESSAGE
  const channel = await message.guild.channels.resolve(guildConfig.announcementsChannel);
  let eventMessage = await channel.messages.fetch(event.messageId);
  if (!eventMessage) return message.channel.send("There was a problem with your request, as event message no longer exists.");

  await updateEventMessage(res.data.data.event, eventMessage);
  message.channel.send("Event updated successfully!");
};

