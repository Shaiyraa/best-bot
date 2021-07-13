const axios = require('axios');
const validateResponse = require("../../utils/validateResponse")
const validateResponseRegex = require("../../utils/validateResponseRegex")
const isGuildInDB = require('../../utils/isGuildInDB')

module.exports = async (message, param) => {

  // 1. CHECK IF CONFIG EXPISTS
  const guildConfig = await isGuildInDB(message)
  if (!guildConfig) return;

  if (!param) {
    // ask for param
    // validate: only ap, aap, dp, familyName, class, stance, proof
    message.channel.send('What do you want to update (ap, aap, dp, family, class, stance, proof)?');
    param = await validateResponse(message, "Invalid response (options: ap, aap, dp, family, class, stance, proof)", ["ap", "aap", "dp", "family", "class", "stance", "proof"]);
    if (param === "exit") {
      message.channel.send("Bye!");
      return;
    }
  }

  let value;
  let query;

  switch (param) {
    case "ap": {
      message.channel.send(`Provide ${param.toUpperCase()} value:`);
      value = await validateResponseRegex(message, "Invalid format", /^([0-9])+$/g);
      if (value === "exit") {
        message.channel.send("Bye!");
        return;
      };
      param = "regularAp"
      break;
    };
    case "aap": {
      message.channel.send(`Provide ${param.toUpperCase()} value:`);
      value = await validateResponseRegex(message, "Invalid format", /^([0-9])+$/g);
      if (value === "exit") {
        message.channel.send("Bye!");
        return;
      };
      param = "awakeningAp"
      break;
    };
    case "dp": {
      message.channel.send(`Provide ${param.toUpperCase()} value:`);
      value = await validateResponseRegex(message, "Invalid format", /^([0-9])+$/g);
      if (value === "exit") {
        message.channel.send("Bye!");
        return;
      };
      break;
    };
    case "family": {
      message.channel.send("What is your family name?");
      value = await validateResponseRegex(message, "Invalid format", /^([a-z]|[A-Z]|_)[^0-9]+$/g);
      if (value === "exit") {
        message.channel.send("Bye!");
        return;
      }
      param = "familyName"
      break;
    };
    case "class": {
      message.channel.send("What is your character's class?");
      value = await validateResponse(message, "This class doesn't exist", ["archer", "berserker", "dark knight", "guardian", "hashashin", "kunoichi", "lahn", "maehwa", "musa", "mystic", "ninja", "nova", "ranger", "sage", "shai", "sorceress", "striker", "tamer", "valkyrie", "warrior", "witch", "wizard"]);
      if (value === "exit") {
        message.channel.send("Bye!");
        return;
      }
      param = "characterClass"
      break;
    };
    case "stance": {
      message.channel.send("Do you play awakening or succession?");
      value = await validateResponse(message, "Invalid response", ["succession", "awakening"]);
      if (value === "exit") {
        message.channel.send("Bye!");
        return;
      };
      break;
    };
    case "proof": {
      message.channel.send(`Provide a link:`);
      value = await validateResponseRegex(message, "Invalid format", /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);
      if (value === "exit") {
        message.channel.send("Bye!");
        return;
      };
      break;
    };
  }

  let resUser;
  try {
    resUser = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/users/discord/${message.author.id}`,
      data: {
        guild: guildConfig._id
      }
    });

  } catch (err) {
    message.channel.send(err.response.data.message);
    console.log(err);
    return;
  };
  const user = resUser.data.data.user

  // 3. CALL API
  let res;
  try {
    res = await axios.patch(`http://localhost:3000/api/v1/users/${user._id}?${param}=${value}`)
  } catch (err) {
    message.channel.send(err.response.data.message);
    console.log(err);
    return;
  }

  message.channel.send("Profile updated")
};

// FIXME: send the param in the request query ${param}=${value}