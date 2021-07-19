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
      showProfile(message, guildConfig, args[1], args[2]);
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
        "**create**",
        "• ?profile create - to create new profile",
        "\n**display**",
        "• ?profile show [family name] - to show member's profile; use without [family name] to see your own profile",
        "• ?profile show [family name] full - to show full member's profile, even though it's set to private - officers only (everyone who has access to the channel, will see it, so use it cautiously!)", // TODO: config for officers only channel and restrict the command to it
        "• ?profile list - to display all profiles",
        "\n**modify**",
        "• ?profile edit - to edit your profile",
        "• ?profile private [true/false] - to set your profile to private/public",
        "\n**delete**",
        "• ?profile delete [familyName] - to delete other profiles (officers only) or your profile",
        "\nwords in [] are command params, it means you have to replace them with your own - without brackets, for example: ?profile private false"
      ]);
    };
  };
};

module.exports.help = {
  name: "profile",
  description: "Display member profiles and manage your profile.\n?profile to learn more"
};