const axios = require('axios');
const isGuildInDB = require('../../utils/isGuildInDB');
const validateResponse = require('../../utils/validators/validateResponse');
const validateRole = require('../../utils/validators/validateRole');
const validateChannel = require('../../utils/validators/validateChannel');
const validateContent = require("../../utils/validators/validateContent");
const deleteMemberProfileFromDB = require('../../utils/deleteMemberProfileFromDB');
const fetchAllMembersAndDeleteTheirProfiles = require('./fetchAllMembersAndDeleteTheirProfiles');

module.exports = async (message, param) => {

  // 1. CHECK IF CONFIG EXISTS
  const guildConfig = await isGuildInDB(message);
  if (!guildConfig) return;

  if (!param) {
    // 2. ASK WHAT TO UPDATE
    message.channel.send('What do you want to update (memberRole, botmasterRole, announcementsChannel, remindersChannel, defaultEventMessage)?');
    param = await validateResponse(message, "Invalid response (memberRole, botmasterRole, announcementsChannel, remindersChannel, defaultEventMessage)", ["memberRole", "officerRole", "announcementsChannel", "remindersChannel", "defaultEventMessage"]);
    if (param === "exit") return message.channel.send("Bye!");
  }

  // 3. ASK FOR VALUE
  let value;
  switch (param) {
    case "memberRole": {
      message.channel.send("Tag the member role (be careful, this will cause all the member profiles to be deleted!):");
      value = await validateRole(message);
      if (value === "exit") return message.channel.send("Bye!");

      await fetchAllMembersAndDeleteTheirProfiles(guildConfig._id)
      break;
    };
    case "officerRole": {
      message.channel.send("Tag the bot master role:");
      value = await validateRole(message);
      if (value === "exit") return message.channel.send("Bye!");

      break;
    };
    case "announcementsChannel": {
      message.channel.send("Tag the channel where you want your event announcements to pop up:");
      value = await validateChannel(message);
      if (value === "exit") return message.channel.send("Bye!");

      break;
    };
    case "remindersChannel": {
      message.channel.send("Tag the channel where you want to see reminders for events:");
      value = await validateChannel(message);
      if (value === "exit") return message.channel.send("Bye!");

      break;
    };
    case "defaultEventMessage": {
      message.channel.send("Type in the content (max. 1024 characters allowed):");
      value = await validateContent(message);
      if (value === "exit") return message.channel.send("Bye!");

      break;
    };
    default: {
      return message.channel.send(`I can't update ${param}.`);
    };
  };

  // 4. CALL API
  let res;
  try {
    res = await axios.patch(`${process.env.API_URL}/api/v1/guilds/${guildConfig._id}?${param}=${value}`);
  } catch (err) {
    console.log(err);
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  message.channel.send("Config updated!");
};