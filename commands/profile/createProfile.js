const axios = require('axios');
const isGuildInDB = require('../../utils/isGuildInDB');
const validateResponseRegex = require('../../utils/validators/validateResponseRegex');
const validateClass = require('../../utils/validators/validateClass');
const validateStance = require('../../utils/validators/validateStance');


module.exports = async (message, guildConfig) => {

  // 1. CHECK IF PROFILE ALREADY EXISTS
  let res;
  try {
    res = await axios({
      method: 'GET',
      url: `${process.env.API_URL}/api/v1/users/discord/${message.author.id}`,
      data: {
        guild: guildConfig._id
      }
    });

    // if API call doesn't return err = user exists
    if (res.data.data.user) return message.channel.send("Your profile is already created. If you want to modify it, use ?profile edit [stat you want to edit]");

  } catch (err) {
    // do stuff only if response is other than not found
    if (err.response.status !== 404) {
      console.log(err);
      return message.channel.send("There was a problem with your request. Please, try again later.");
    };
  };

  // 2. ASK FOR PARAMS
  message.channel.send("What is your family name?");
  const familyName = await validateResponseRegex(message, "Invalid format", /^([a-z]|[A-Z]|_)[^0-9]+$/g);
  if (familyName === "exit") return message.channel.send("Bye!");

  message.channel.send("What is your character's class?");
  const characterClass = await validateClass(message);
  if (characterClass === "exit") return message.channel.send("Bye!");

  let stance;
  if (characterClass === "shai") {
    stance = "awakening"
  } else {
    message.channel.send("Do you play awakening or succession?");
    stance = await validateStance(message);
    if (stance === "exit") return message.channel.send("Bye!");
  }

  message.channel.send("What is your regular AP?");
  const regularAp = await validateResponseRegex(message, "Invalid format", /^([0-9])+$/g);
  if (regularAp === "exit") return message.channel.send("Bye!");

  message.channel.send("What is your awakening AP?");
  const awakeningAp = await validateResponseRegex(message, "Invalid format", /^([0-9])+$/g);
  if (awakeningAp === "exit") return message.channel.send("Bye!");

  message.channel.send("What is your DP?");
  const dp = await validateResponseRegex(message, "Invalid format", /^([0-9])+$/g);
  if (dp === "exit") return message.channel.send("Bye!");

  // TODO: ask for level

  // 3. CREATE PROFILE
  try {
    await axios.post(`${process.env.API_URL}/api/v1/users`, {
      id: message.author.id,
      familyName,
      characterClass,
      stance,
      regularAp,
      awakeningAp,
      dp,
      guild: guildConfig._id
    });
  } catch (err) {
    console.log(err);
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  message.channel.send("Profile created! use `?profile show` to see more details");
}