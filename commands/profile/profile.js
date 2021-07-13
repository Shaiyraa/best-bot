const Discord = require('discord.js');
const createProfile = require("./createProfile");
const showProfile = require("./showProfile");
const listProfiles = require("./listProfiles");
const editProfile = require("./editProfile");
const togglePrivate = require("./togglePrivate");
const isGuildInDB = require('../../utils/isGuildInDB')
const sendEmbedMessage = require("../../utils/sendEmbedMessage");

module.exports.run = async (bot, message, args) => {

  // CHECK IF CONFIG EXPISTS
  const guildConfig = await isGuildInDB(message);
  if (!guildConfig) return;

  switch (args[0]) {
    case "create": {
      createProfile(message, guildConfig);
      break;
    };
    case "show": {
      showProfile(message, guildConfig, args[1]);
      break;
    };
    case "list": {
      await listProfiles(message, guildConfig);
      break;
    };
    case "edit": {
      editProfile(message, guildConfig, args[1]);
      break;
    };
    case "private": {
      togglePrivate(message, guildConfig, args[1]);
      break;
    };
    default: {
      sendEmbedMessage(message.channel, "Options:", [
        "?profile create - to create new profile",
        "?profile show [discord name / family name] - to show member's profile; use without [name] to see your own profile",
        "?profile list - to display all profiles",
        "?profile edit - to edit your profile",
        "?profile private [true/false] - to set your profile to private/public"
      ]);
    };
  };
};

module.exports.help = {
  name: "profile",
  description: "display member profiles and manage your profile"
};