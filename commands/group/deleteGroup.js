const axios = require('axios');

module.exports = async (message, guildConfig, groupName) => {

  if (!groupName) return message.channel.send("Please, specify the group name. Try ?group delete [group name]")

  // 1. CHECK IF GROUP EXISTS
  let group = guildConfig.groups.filter(group => group.name === groupName.toUpperCase());
  if (!group.length) return message.channel.send("Wrong group name.");
  group = group[0];

  // 2. CONFIRM DECISION
  message.channel.send(`Are you sure that you want to delete ${group.name}? Type "yes" to confirm.`);
  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
    .then(async m => {
      m = m.first();
      if (m.content.toLowerCase() === "yes") {

        // 3. CALL API
        let res;
        try {
          res = await axios.delete(`http://localhost:3000/api/v1/groups/${group._id}`);
        } catch (err) {
          message.channel.send(err.response.data.message);
          return console.log(err);
        };

        message.channel.send("Group has been deleted");
      };
    })
    .catch((err) => {
      console.log(err);
    });
};