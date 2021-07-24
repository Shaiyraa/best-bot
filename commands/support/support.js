const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
  
  const embed = new Discord.MessageEmbed()
  .setTitle("Support")
  .setDescription("If you ran into any issues while using the bot, please message <@303593811505053698>")
  //.addField("Website:", "somewebsite.com")
  .setFooter("Created by Shaiyra")

  message.channel.send(embed)
};

module.exports.help = {
  name: "support",
  description: "See contact info of the creator and ways to get technical support."
};