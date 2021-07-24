const Discord = require('discord.js');
const createProfile = require("./createProfile");
const showProfile = require("./showProfile");
const listProfiles = require("./listProfiles");
const editProfile = require("./editProfile");
const togglePrivate = require("./togglePrivate");
const deleteProfile = require("./deleteProfile");

const config = require('../../config.json');
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
      const [first, ...otherArgs] = args
      createProfile(message, guildConfig, otherArgs);
      break;
    };
    case "show": {
      showProfile(message, guildConfig, args[1], args[2]);
      break;
    };
    case "list": {
      const sortBy = args[1];
      const sortMethod = args[2];
      await listProfiles(message, guildConfig, sortBy, sortMethod);
      break;
    };
    case "edit": {
      editProfile(message, guildConfig, args[1], args[2]);
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
      const basicOptions = [
        "**create**",
        "• `?profile create` - to create new profile",

        "\n**display**",
        "• `?profile show` - to show your own profile",
        "• `?profile show [family name]` - to show member's profile",
        "• `?profile list` - to display all profiles ordered by gearscore",

        "\n**modify**",
        "• `?profile edit` - to edit your profile",
        "• `?profile private [true/false]` - to set your profile to private/public",

        "\n**delete**",
        "• `?profile delete` - to delete your profile",

        "\n**BOT MASTER ZONE**",
        "**display**",
        "• `?profile show [family name] full` - to show full member's profile, even though it's set to private - bot masters only (everyone who has access to the channel, will see it, so use it cautiously!)", // TODO: config for bot masters only channel and restrict the command to it

        "\n**delete**",
        "• `?profile delete [familyName]` - to delete members profiles (bot masters only)",
       
        "\nwords in [] are command params, it means you have to replace them with your own - without brackets, for example: ?profile private false"
      ];

      // 1. SEND MESSAGE
      const embed = new Discord.MessageEmbed()
        .setTitle("Options")
        .setDescription(basicOptions)
        .setFooter(`click on the icon to see options for advanced users`);

      const helpMessage = await message.channel.send(embed)

      // 2. REACT WITH DUDE WITH TOOL
      await helpMessage.react(config.advancedUserEmoji)

      // 3. CREATE LISTENER
      const filter = (reaction, user) => {
        if (reaction.emoji.name !== config.advancedUserEmoji) {
          let reactionMap = reactionMessage.reactions.resolve(reaction.emoji.id) || reactionMessage.reactions.resolve(reaction.emoji.name);
          reactionMap?.users.remove(user.id);
        };
        return reaction.emoji.name === config.advancedUserEmoji
      };
    
      const collector = helpMessage.createReactionCollector(filter, { max: 1, dispose: true });
      collector.on('collect', async (reaction, user) => {

        const advancedOptions = [
          "**create**",
          "• `?profile create` - to create new profile",
          "• `?profile create [family name] [class] [ap] [aap] [dp] [lvl]` - to create new profile using quick setup",

          "\n**display**",
          "• `?profile show` - to show your own profile",
          "• `?profile show [family name]` - to show member's profile",
          "• `?profile list` - to display all profiles ordered by gearscore",
          "• `?profile list [sortBy]` - to display all profiles ordered by param (ap, aap, dp, gearscore, class, update)",
          "• `?profile list [sortBy] [asc/desc]` - to specify also the sort method; asc/a = ascending, desc/d = descending",

          "\n**modify**",
          "• `?profile edit` - to edit your profile",
          "• `?profile edit [param] [value]` - to edit your profile quicker way",
          "• `?profile private [true/false]` - to set your profile to private/public",

          "\n**delete**",
          "• `?profile delete` - to delete your profile",

          "\n**BOT MASTER ZONE**",
          "**display**",
          "• `?profile show [family name] full` - to show full member's profile, even though it's set to private - bot masters only (everyone who has access to the channel, will see it, so use it cautiously!)", // TODO: config for bot masters only channel and restrict the command to it

          "\n**delete**",
          "• `?profile delete [familyName]` - to delete members profiles (bot masters only)",
        ]

        const advancedEmbed = new Discord.MessageEmbed()
        .setTitle("Advanced Options")
        .setDescription(advancedOptions);
        
        // 4. EDIT MESSAGE WITH ADVANCED STUFF
        helpMessage.edit(advancedEmbed);
        helpMessage.reactions.removeAll();
      });
    };
  };
};

module.exports.help = {
  name: "profile",
  description: "Display member profiles and manage your profile.\n?profile to learn more"
};