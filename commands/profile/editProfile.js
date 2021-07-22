const axios = require('axios');
const isUserInDB = require('../../utils/isUserInDB');
const validateResponse = require("../../utils/validators/validateResponse");
const validateResponseRegex = require("../../utils/validators/validateResponseRegex");
const validateClass = require("../../utils/validators/validateClass");
const validateStance = require("../../utils/validators/validateStance");
const config = require('../../config.json');

module.exports = async (message, guildConfig, param, value) => {

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

  param = param.toLowerCase();

  // 2b. GET VALUE
  switch (param) {
    case "ap": {
      if(!value) {
        message.channel.send(`Provide ${param.toUpperCase()} value:`);
        value = await validateResponseRegex(message, "Invalid format", /^([1-9][0-9]{0,2})$/g);
        if (value === "exit") return message.channel.send("Bye!");
      } else {
        if(!value.match(/^([1-9][0-9]{0,2})$/g)) return message.channel.send("Invalid value.");
      }
      
      param = "regularAp";
      break;
    };
    case "aap": {
      if(!value) {
        message.channel.send(`Provide ${param.toUpperCase()} value:`);
        value = await validateResponseRegex(message, "Invalid format", /^([1-9][0-9]{0,2})$/g);
        if (value === "exit") return message.channel.send("Bye!");
      } else {
        if(!value.match(/^([1-9][0-9]{0,2})$/g)) return message.channel.send("Invalid value.");
      }

      param = "awakeningAp";
      break;
    };
    case "dp": {
      if(!value) {
        message.channel.send(`Provide ${param.toUpperCase()} value:`);
        value = await validateResponseRegex(message, "Invalid format", /^([1-9][0-9]{0,2})$/g);
        if (value === "exit") return message.channel.send("Bye!");
      } else {
        if(!value.match(/^([1-9][0-9]{0,2})$/g)) return message.channel.send("Invalid value.");
      }

      break;
    };
    case "family": {
      if(!value) {
        message.channel.send("What is your family name?");
        value = await validateResponseRegex(message, "Invalid format", /^([a-z]|[A-Z]|_)[^0-9]+$/g);
        if (value === "exit") return message.channel.send("Bye!");
      } else {
        if(!value.match(/^([a-z]|[A-Z]|_)[^0-9]+$/g)) return message.channel.send("Invalid value.");
      }
    
      param = "familyName";
      break;
    };
    case "class": {
      if(!value) {
        message.channel.send("What is your character's class?");
        value = await validateClass(message);
        if (value === "exit") return message.channel.send("Bye!");
      } else {
        value = value.toLowerCase();
        if (value === "zerk") value = "berserker"
        if (value === "dk") value = "dark knight"
        if (value === "guard") value = "guardian"
        if (value === "hash") value = "hashashin"
        if (value === "kuno") value = "kunoichi"
        if (value === "mae") value = "maehwa"
        if (value === "sorc") value = "sorceress"
        if (value === "valk") value = "valkyrie"
        if (value === "warr") value = "warrior"
        if (value === "cors") value = "corsair"
        if(!config.classes.includes(value)) return message.channel.send("Invalid class.");
      }
      
      param = "characterClass";
      break;
    };
    case "level": {
      if(!value) {
        message.channel.send("What is your character's level?");
        value = await validateResponseRegex(message, "Invalid format", /^([1-9][0-9]{0,1})$/g);
        if (value === "exit") return message.channel.send("Bye!");
      } else {
        if(!value.match(/^([1-9][0-9]{0,1})$/g)) return message.channel.send("Invalid value.");
      }

      break;
    };
    case "stance": {
      if (user.characterClass === "shai") return message.channel.send("Shais can't change their stance!");

      if(!value) {
        message.channel.send("Do you play awakening or succession?");
        value = await validateStance(message);
        if (value === "exit") return message.channel.send("Bye!");
      } else {
        value = value.toLowerCase();
        if (value === "a" || value === "awa") value = "awakening"
        if (value === "s" || value === "succ") value = "succession"
        if(!config.stance.includes(value)) return message.channel.send("Invalid stance.");
      }

      break;
    };
    case "proof": {
      if(!value) {
        message.channel.send("Provide a link:");
        value = await validateResponseRegex(message, "Invalid format", /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);
        if (value === "exit") return message.channel.send("Bye!");
      } else {
        if(!value.match(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi)) return message.channel.send("Invalid link.");
      }

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
