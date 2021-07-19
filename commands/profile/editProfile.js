const axios = require('axios');
const isUserInDB = require('../../utils/isUserInDB')
const validateResponse = require("../../utils/validators/validateResponse")
const validateResponseRegex = require("../../utils/validators/validateResponseRegex")
const validateClass = require("../../utils/validators/validateClass")
const validateStance = require("../../utils/validators/validateStance")

module.exports = async (message, guildConfig, param) => {

  // 1. CHECK IF USER EXISTS
  const user = await isUserInDB(message.author.id, guildConfig._id)
  if (!user) return message.channel.send("Profile not found. Try ?profile create");

  // 2a. GET PARAM
  if (!param) {
    // ask for param
    message.channel.send('What do you want to update (ap, aap, dp, family, class, stance, proof)?');
    param = await validateResponse(message, "Invalid response (options: ap, aap, dp, family, class, stance, proof)", ["ap", "aap", "dp", "family", "class", "stance", "proof"]);
    if (param === "exit") return message.channel.send("Bye!");
  };

  // 2b. GET VALUE
  let value;
  switch (param) {
    case "ap": {
      message.channel.send(`Provide ${param.toUpperCase()} value:`);
      value = await validateResponseRegex(message, "Invalid format", /^([1-9][0-9]{0,2})$/g);
      if (value === "exit") return message.channel.send("Bye!");
      param = "regularAp";

      break;
    };
    case "aap": {
      message.channel.send(`Provide ${param.toUpperCase()} value:`);
      value = await validateResponseRegex(message, "Invalid format", /^([1-9][0-9]{0,2})$/g);
      if (value === "exit") return message.channel.send("Bye!");
      param = "awakeningAp";

      break;
    };
    case "dp": {
      message.channel.send(`Provide ${param.toUpperCase()} value:`);
      value = await validateResponseRegex(message, "Invalid format", /^([1-9][0-9]{0,2})$/g);
      if (value === "exit") return message.channel.send("Bye!");

      break;
    };
    case "family": {
      message.channel.send("What is your family name?");
      value = await validateResponseRegex(message, "Invalid format", /^([a-z]|[A-Z]|_)[^0-9]+$/g);
      if (value === "exit") return message.channel.send("Bye!");
      param = "familyName";

      break;
    };
    case "class": {
      message.channel.send("What is your character's class?");
      value = await validateClass(message);
      if (value === "exit") return message.channel.send("Bye!");
      param = "characterClass";

      break;
    };
    case "level": {
      message.channel.send("What is your character's level?");
      value = await validateResponseRegex(message, "Invalid format", /^([1-9][0-9]{0,1})$/g);
      if (value === "exit") return message.channel.send("Bye!");

      break;
    };
    case "stance": {
      if (user.characterClass === "shai") return message.channel.send("Shais can't change their stance!");

      message.channel.send("Do you play awakening or succession?");
      value = await validateStance(message);
      if (value === "exit") return message.channel.send("Bye!");

      break;
    };
    case "proof": {
      message.channel.send("Provide a link:");
      value = await validateResponseRegex(message, "Invalid format", /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);
      if (value === "exit") return message.channel.send("Bye!");

      break;
    };
    default: {
      return message.channel.send(`I can't update ${param}.`);
    };
  };

  // 3. CALL API TO UPDATE
  let res;
  try {
    res = await axios.patch(`${process.env.API_URL}/api/v1/users/${user._id}?${param}=${value}`);
  } catch (err) {
    console.log(err)
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  message.channel.send("Profile updated");
};
