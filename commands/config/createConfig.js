const axios = require('axios');
const validateRole = require('../../utils/validators/validateRole');
const validateChannel = require('../../utils/validators/validateChannel');

module.exports = async (message) => {

  // 1. RESTRICT ROLE
  if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("Only administrators can this command.");

  // 2. CHECK IF GUILD CONFIG ALREADY EXISTS
  let res;
  try {
    res = await axios({
      method: 'GET',
      url: `${process.env.API_URL}/api/v1/guilds/discord/${message.channel.guild.id}`
    });

    // if API call doesn't return err = guild exists
    return message.channel.send("Config for your guild already exists. Try ?config edit to update it."); // TODO: "would you like to modify it? yes/no"

  } catch (err) {
    if (err.response.status !== 404) {
      console.log(err);
      return message.channel.send("There was a problem with your request. Please, try again later.");
    };
  };

  // 3. ASK FOR PARAMS
  message.channel.send("Tag guild member role:");
  let memberRoleTag = await validateRole(message);
  if (memberRoleTag === "exit") return message.channel.send("Bye!");

  message.channel.send("Tag guild officer role:")
  let officerRoleTag = await validateRole(message);
  if (officerRoleTag === "exit") return message.channel.send("Bye!");

  message.channel.send("Tag the channel where you want your event announcements to pop up:");
  let announcementsChannelTag = await validateChannel(message, "Invalid channel");
  if (announcementsChannelTag === "exit") return message.channel.send("Bye!");

  message.channel.send("Tag the channel where you want to see reminders for events:");
  let remindersChannelTag = await validateChannel(message, "Invalid channel");
  if (remindersChannelTag === "exit") return message.channel.send("Bye!");

  // 4. CREATE GUILD DOC
  try {
    await axios({
      method: 'POST',
      url: `${process.env.API_URL}/api/v1/guilds`,
      data: {
        id: message.channel.guild.id,
        memberRole: memberRoleTag,
        officerRole: officerRoleTag,
        announcementsChannel: announcementsChannelTag,
        remindersChannel: remindersChannelTag
      }
    });
  } catch (err) {
    console.log(err);
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  message.channel.send("Config updated.");
};