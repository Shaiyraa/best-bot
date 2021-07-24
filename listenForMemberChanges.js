const axios = require('axios');
const logger = require('./logger');
const deleteMemberProfileFromDB = require('./utils/deleteMemberProfileFromDB');

module.exports = bot => {
  // remove member's profile from db when @member role removed
  bot.on("guildMemberUpdate", async (oldMember, newMember) => {
    if (oldMember.roles.cache.size > newMember.roles.cache.size) {

      // 1. FIND GUILD CONFIG
      let res;
      try {
        res = await axios({
          method: 'GET',
          url: `${process.env.API_URL}/api/v1/guilds/discord/${newMember.guild.id}`
        });
      } catch (err) {
        logger.log({
          level: 'error',
          timestamp: Date.now(),
          commandAuthor: {
            id: message.author.id,
            username: message.author.username,
            tag: message.author.tag
          },
          message: err
        });
        
        if (err.response.status === 404) return newMember.guild.owner.send(`User ${newMember.user.tag} just lost a role on your server ${newMember.guild.name}, but guild config is not set, so I'm not sure what role that was. If it was a guild member role, you might wanna delete his profile manually (?profile delete [familyName]), so it doesn't cause trouble with events attendance. Make sure to create new config, so I can do that for you automatically in the future!`);

      };

      // 2. GET @MEMBER ROLE
      const guildConfig = res.data.data.guild
      if (oldMember.roles.cache.has(guildConfig.memberRole) && !newMember.roles.cache.has(guildConfig.memberRole)) {

        // 3. DELETE PROFILE
        await deleteMemberProfileFromDB(newMember.id, guildConfig._id, "bot")
      }
    }
  });

  bot.on("guildMemberLeave", async (oldMember, newMember) => {
    // 1. FIND GUILD CONFIG
    let res;
    try {
      res = await axios({
        method: 'GET',
        url: `${process.env.API_URL}/api/v1/guilds/discord/${newMember.guild.id}`
      });
    } catch (err) {
      logger.log({
        level: 'error',
        timestamp: Date.now(),
        commandAuthor: {
          id: message.author.id,
          username: message.author.username,
          tag: message.author.tag
        },
        message: err
      });

      if (err.response.status === 404) {
        if (!guildConfig) {
          return newMember.guild.owner.send(`User ${newMember.user.tag} just left your server ${newMember.guild.name}, but guild config is not set, so I can't delete his profile. You might wanna do it manually (?profile delete [familyName]), so it doesn't cause trouble with events attendance. Make sure to create new config, so I can do that for you automatically in the future!`);
        }
      }
    };
    const guildConfig = res.data.data.guild

    // 2. DELETE PROFILE
    await deleteMemberProfileFromDB(newMember.id, guildConfig._id, "bot")
  });
};
