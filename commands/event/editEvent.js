const axios = require('axios');
const validateContent = require("./validateContent")
const validateResponse = require("../../utils/validateResponse")
const validateResponseRegex = require("../../utils/validateResponseRegex")
const updateEventMessage = require("../../utils/updateEventMessage")

module.exports = async (message, guildConfig, event) => {

  // 1. SET NEW VALUES
  let newType = event.type
  let newMandatory = event.mandatory
  let newAlerts = event.alerts
  let newContent = event.content

  // type
  message.channel.send('What is the type of the event? Possible types: "nodewar", "siege", "guildevent". Type "next", to skip and leave previous value.');
  let typeAnswer = await validateResponse(message, "Invalid response (nodewar, siege, guildevent)", ["nodewar", "siege", "guildevent", "next"]);
  if (typeAnswer === "exit") {
    message.channel.send("Bye!");
    return;
  }
  if (typeAnswer !== "next") newType = typeAnswer


  // mandatory
  message.channel.send('Is the event mandatory (yes/no)? Type "next", to skip and leave previous value.');
  mandatoryAnswer = await validateResponse(message, "Invalid answer (yes/no).", ["yes", "no", "next"]);
  if (mandatoryAnswer === "exit") {
    message.channel.send("Bye!");
    return;
  }
  if (alertsAnswer !== "next") {
    mandatoryAnswer === "yes" ?
      newMandatory = true
      :
      newMandatory = false
  }

  // alerts
  message.channel.send('Do you want to enable automatic alerts (yes/no)? Type "next", to skip and leave previous value.');
  alertsAnswer = await validateResponse(message, "Invalid answer (yes/no).", ["yes", "no", "next"]);
  if (alertsAnswer === "exit") {
    message.channel.send("Bye!");
    return;
  }
  if (alertsAnswer !== "next") {
    alertsAnswer === "yes" ?
      newAlerts = true
      :
      newAlerts = false
  };

  // content
  message.channel.send('Do you want to create a custom message (yes/no)? Type "next", to skip and leave previous value.');
  const contentResponse = await validateResponse(message, "Invalid answer (Valid options: yes/no).", ["yes", "no", "next"]);

  switch (contentResponse) {
    case "exit": {
      message.channel.send("Bye!");
      return;
    }
    case "next": {
      break;
    }
    case "yes": {
      message.channel.send("Type in the content (max. 1024 characters allowed):")
      newContent = await validateContent(message)
      break;
    };
    default: {
      newContent = "no description";
    }
  }

  // 2. CALL API

  let res;
  try {
    res = await axios.patch(`http://localhost:3000/api/v1/events/${event._id}`, {
      type: newType,
      mandatory: newMandatory,
      alerts: newAlerts,
      content: newContent
    });
  } catch (err) {
    message.channel.send("There was a problem with your request. Please, try again later.");
    console.log(err);
    return
  }

  // 3. UPDATE MESSAGE
  const channel = await message.guild.channels.resolve(guildConfig.announcementsChannel)
  let eventMessage = await channel.messages.fetch(event.messageId)
  if (!eventMessage) {
    message.channel.send("There was a problem with your request, as event message no longer exists.")
    return
  }

  await updateEventMessage(res, eventMessage)
  message.channel.send("Event updated successfully!")
};

