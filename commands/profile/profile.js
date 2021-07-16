const Discord = require('discord.js');
const createProfile = require("./createProfile");
const showProfile = require("./showProfile");
const listProfiles = require("./listProfiles");
const editProfile = require("./editProfile");
const togglePrivate = require("./togglePrivate");
const deleteProfile = require("./deleteProfile");
const isGuildInDB = require('../../utils/isGuildInDB')
const sendEmbedMessage = require("../../utils/sendEmbedMessage");
const hasRole = require('../../utils/hasRole');

module.exports.run = async (bot, message, args) => {


  // 1. CHECK IF CONFIG EXISTS
  const guildConfig = await isGuildInDB(message);
  if (!guildConfig) return;

  // 2. CHECK IF MEMBER
  const isMember = await hasRole(message, guildConfig.memberRole)
  if (!isMember) return message.channel.send(`Only <@&${guildConfig.memberRole}> can use this command.`, { "allowedMentions": { "users": [] } });

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
    case "delete": {
      deleteProfile(message, guildConfig, args[1]);
      break;
    };
    default: {
      sendEmbedMessage(message.channel, "Options:", [
        "?profile create - to create new profile",
        "?profile show [discord name / family name] - to show member's profile; use without [name] to see your own profile",
        "?profile list - to display all profiles",
        "?profile edit - to edit your profile",
        "?profile private [true/false] - to set your profile to private/public",
        "?profile delete [familyName] - to delete other profiles (officers only) or your profile"
      ]);
    };
  };
};

module.exports.help = {
  name: "profile",
  description: "display member profiles and manage your profile"
};