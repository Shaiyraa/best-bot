const Discord = require('discord.js');
const isGuildInDB = require('../../utils/isGuildInDB');
const sendEmbedMessage = require('../../utils/sendEmbedMessage');

module.exports = async (message) => {

  // 1. CHECK IF CONFIG EXISTS
  const guildConfig = await isGuildInDB(message);
  if (!guildConfig) return;

  // 2. CREATE EMBED
  const embed = new Discord.MessageEmbed()
  .setTitle("Config:")
  .addField("Member role:", `<@&${guildConfig.memberRole}>`)
  .addField("Officer role:", `<@&${guildConfig.officerRole}>`)
  .addField("Announcements channel:", `<#${guildConfig.announcementsChannel}>`)
  .addField("Reminders channel:", `<#${guildConfig.remindersChannel}>`)
  .addField("Default message:", guildConfig.defaultEventMessage);
  
  // 3. SEND EMBED
  message.channel.send(embed);
};