const Discord = require('discord.js');
const axios = require('axios');
const isGuildInDB = require('../../utils/isGuildInDB');

module.exports = async (message, guildConfig, familyName) => {

  // if family doesn't exist, request user object by discord id first
  if (!familyName) {
    let res;
    try {
      res = await axios({
        method: 'GET',
        url: `http://localhost:3000/api/v1/users/discord/${message.author.id}`,
        data: {
          guild: guildConfig._id
        }
      });
    } catch (err) {
      if (err.response.status === 404) return message.channel.send("This profile doesn't exist. Try ?profile create");
      console.log(err);
      return message.channel.send("There was a problem with your request. Please, try again later.");
    };

    familyName = res.data.data.user.familyName;
  }

  let res;
  try {
    res = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/users?familyName=${familyName}&guild=${guildConfig._id}`
    });

  } catch (err) {
    if (err.response.status === 404) return message.channel.send("This profile doesn't exist.");
    console.log(err);
    return message.channel.send("There was a problem with your request. Please, try again later.");
  }

  const user = res.data.data.users[0];

  const embed = new Discord.MessageEmbed().setDescription(`Profile of **${user.familyName}**:`);

  if (!user.private) {
    embed.addField("AP:", user.regularAp, true)
      .addField("AAP:", user.awakeningAp, true)
      .addField("DP:", user.dp, true)
      .addField("Level:", `99`, true)
      .addField("Proof:", `[Link](https://media.tenor.com/images/a1505c6e6d37aa2b7c5953741c0177dc/tenor.gif)`, true);
  } else {
    embed.setFooter("Profile set to private");
  };

  embed.addField("Class:", `${user.characterClass === "shai" ? "" : user.stance} ${user.characterClass}`, false)
    .addField("Nodewar Group:", `${user.group ? user.group.name : "DEFAULT"}`, true);
  //.setColor("#58de49");

  message.channel.send(embed);
};