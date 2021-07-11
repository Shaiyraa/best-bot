const axios = require('axios');
const isGuildInDB = require('../../utils/isGuildInDB');

module.exports = async (message, familyName) => {

  // 1. CHECK IF CONFIG EXPISTS
  const guildConfig = await isGuildInDB(message)
  if (!guildConfig) return;

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
      message.channel.send("There was a problem with your request. Please, try again later.");
      console.log(err);
      return;
    }

    familyName = res.data.data.user.familyName;
  }

  let res;
  try {
    res = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/users/`,
      data: {
        familyName,
        guild: guildConfig._id
      }
    });

  } catch (err) {

    if (err.response.status === 404) {
      message.channel.send("This profile doesn't exist.");
      return;
    }

    message.channel.send("There was a problem with your request. Please, try again later.");
    console.log(err);
    return;

  }
  const user = res.data.data.users[0];

  message.channel.send(`This command is not fully supported yet, but here's your family name: ${user.familyName}`); // TODO: send embed with more info 
}