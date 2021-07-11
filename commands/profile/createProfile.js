const validateResponseRegex = require('../../utils/validateResponseRegex')
const axios = require('axios')
const validateResponse = require('../../utils/validateResponse')
const isGuildInDB = require('../../utils/isGuildInDB')


module.exports = async (message) => {

  // 1. CHECK IF CONFIG EXPISTS
  const guildConfig = await isGuildInDB(message)
  if (!guildConfig) return;

  // 2. CHECK IF PROFILE ALREADY EXISTS
  let res;
  try {
    res = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/users/discord/${message.author.id}`,
      data: {
        guild: guildConfig._id
      }
    });

    // if API call doesn't return err = user exists
    message.channel.send("Your profile is already created. If you want to modify it, use ?profile edit [stat you want to edit]");
    return;

  } catch (err) {
    // do stuff only if response is other than not found
    if (err.response.status !== 404) {
      message.channel.send("There was a problem with your request. Please, try again later.");
      console.log(err);
      return;
    };
  };

  // 3. ASK FOR PARAMS
  message.channel.send("What is your family name?");
  const familyName = await validateResponseRegex(message, "Invalid format", /^([a-z]|[A-Z]|_)[^0-9]+$/g);
  if (familyName === "exit") {
    message.channel.send("Bye!");
    return;
  }

  message.channel.send("What is your character's class?");
  const characterClass = await validateResponse(message, "This class doesn't exist", ["archer", "berserker", "dark knight", "guardian", "hashashin", "kunoichi", "lahn", "maehwa", "musa", "mystic", "ninja", "nova", "ranger", "sage", "shai", "sorceress", "striker", "tamer", "valkyrie", "warrior", "witch", "wizard"]);
  if (characterClass === "exit") {
    message.channel.send("Bye!");
    return;
  }

  message.channel.send("Do you play awakening or succession?");
  const stance = await validateResponse(message, "Invalid response", ["succession", "awakening"]);
  if (stance === "exit") {
    message.channel.send("Bye!");
    return;
  }

  message.channel.send("What is your regular AP?");
  const regularAp = await validateResponseRegex(message, "Invalid format", /^([0-9])+$/g);
  if (regularAp === "exit") {
    message.channel.send("Bye!");
    return;
  }

  message.channel.send("What is your awakening AP?");
  const awakeningAp = await validateResponseRegex(message, "Invalid format", /^([0-9])+$/g);
  if (awakeningAp === "exit") {
    message.channel.send("Bye!");
    return;
  }

  message.channel.send("What is your DP?");
  const dp = await validateResponseRegex(message, "Invalid format", /^([0-9])+$/g);
  if (dp === "exit") {
    message.channel.send("Bye!");
    return;
  }

  // 4. CREATE PROFILE
  try {
    await axios({
      method: 'POST',
      url: `http://localhost:3000/api/v1/users`,
      data: {
        id: message.author.id,
        familyName,
        characterClass,
        stance,
        regularAp,
        awakeningAp,
        dp,
        guild: guildConfig._id
      }
    });
  } catch (err) {
    message.channel.send("There was a problem with your request. Please, try again later.");
    console.log(err);
    return;
  }

  message.channel.send("Profile created! use `?profile show` to see more details");
}