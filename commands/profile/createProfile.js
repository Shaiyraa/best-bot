const axios = require('axios');
const config = require('../../config.json');
const logger = require('../../logger');
const isGuildInDB = require('../../utils/isGuildInDB');
const validateResponseRegex = require('../../utils/validators/validateResponseRegex');
const validateClass = require('../../utils/validators/validateClass');
const validateStance = require('../../utils/validators/validateStance');

module.exports = async (message, guildConfig, params) => {
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

    if(res.data.data.user) return message.channel.send("This profile already exists.");

  } catch (err) {
    // do stuff only if response is other than not found
    if (err?.response.status !== 404) {
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
      return message.channel.send("There was a problem with your request. Please, try again later.");
    } 
  };

  let familyName;
  let characterClass;
  let stance;
  let regularAp;
  let awakeningAp;
  let dp;
  let level;

  // 2a. CHECK IF PARAMS ARE VALID
  if(params.length) {
    familyName = params[0]
    if(!familyName.match(/^([a-z]|[A-Z]|_)[^0-9]+$/g)) return message.channel.send("Invalid family name format"); 

    characterClass = params[1].toLowerCase()
    if (characterClass === "zerk") characterClass = "berserker"
    if (characterClass === "dk") characterClass = "dark knight"
    if (characterClass === "guard") characterClass = "guardian"
    if (characterClass === "hash") characterClass = "hashashin"
    if (characterClass === "kuno") characterClass = "kunoichi"
    if (characterClass === "mae") characterClass = "maehwa"
    if (characterClass === "sorc") characterClass = "sorceress"
    if (characterClass === "valk") characterClass = "valkyrie"
    if (characterClass === "warr") characterClass = "warrior"
    if (characterClass === "cors") characterClass = "corsair"
    
    if(!config.classes.includes(characterClass)) return message.channel.send("Invalid class name."); 

    regularAp = params[2]
    if(!regularAp.match(/^([1-9][0-9]{0,2})$/g)) return message.channel.send("Invalid regular AP."); 

    awakeningAp = params[3]
    if(!awakeningAp.match(/^([1-9][0-9]{0,2})$/g)) return message.channel.send("Invalid awakening AP."); 

    dp = params[4]
    if(!dp.match(/^([1-9][0-9]{0,2})$/g)) return message.channel.send("Invalid DP."); 

    level = params[5]
    if(!level.match(/^([1-9][0-9]{0,1})$/g)) return message.channel.send("Invalid level."); 

    stance = "awakening"
    if(characterClass !== "shai") {
      message.channel.send("Do you play awakening or succession?");
      stance = await validateStance(message);
      if (stance === "exit") return message.channel.send("Bye!");
    }

  } else {
    // 2b. ASK FOR PARAMS
    message.channel.send("What is your family name?");
    familyName = await validateResponseRegex(message, "Invalid format", /^([a-z]|[A-Z]|_)[^0-9]+$/g);
    if (familyName === "exit") return message.channel.send("Bye!");

    message.channel.send("What is your character\ 's class?");
    characterClass = await validateClass(message);
    if (characterClass === "exit") return message.channel.send("Bye!");

    // class easter eggs
    if(characterClass === "musa") message.channel.send("lmao");

    stance = "awakening"
    if (characterClass !== "shai") {
      message.channel.send("Do you play awakening or succession?");
      stance = await validateStance(message);
      if (stance === "exit") return message.channel.send("Bye!");
    }

    message.channel.send("What is your regular AP?");
    regularAp = await validateResponseRegex(message, "Invalid format", /^([1-9][0-9]{0,2})$/g);
    if (regularAp === "exit") return message.channel.send("Bye!");

    message.channel.send("What is your awakening AP?");
    awakeningAp = await validateResponseRegex(message, "Invalid format", /^([1-9][0-9]{0,2})$/g);
    if (awakeningAp === "exit") return message.channel.send("Bye!");

    message.channel.send("What is your DP?");
    dp = await validateResponseRegex(message, "Invalid format", /^([1-9][0-9]{0,2})$/g);
    if (dp === "exit") return message.channel.send("Bye!");

    message.channel.send("What is your level?");
    level = await validateResponseRegex(message, "Invalid format", /^([1-9][0-9]{0,1})$/g);
    if (level === "exit") return message.channel.send("Bye!");
  }

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
      level,
      guild: guildConfig._id
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
    return message.channel.send("There was a problem with your request. Please, try again later.");
  };

  message.channel.send("Profile created! use `?profile show` to see more details");
}