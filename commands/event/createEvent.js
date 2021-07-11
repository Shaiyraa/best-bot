const Discord = require('discord.js');
const config = require('../../config.json');
const validateContent = require('./validateContent');
const validateResponseRegex = require('../../utils/validateResponseRegex');
const validateResponse = require('../../utils/validateResponse');
const isGuildInDB = require('../../utils/isGuildInDB');
const { default: axios } = require('axios');
const updateEventMessage = require('../../utils/updateEventMessage');

module.exports = async (message, date) => {

  // 1. CHECK IF GUILD IS IN DB
  const guildConfig = await isGuildInDB(message);
  if (!guildConfig) return;

  let hour;
  let type;
  let alerts;
  let mandatory;

  // 2a. DATE EXISTS - QUICK SETUP OF PARAMS
  if (date) {
    // set proper date
    hour = "20:00"
    date = new Date(date.split(/\D/g)[2], date.split(/\D/g)[1] - 1, date.split(/\D/g)[0], hour.split(":")[0], hour.split(":")[1]);
    //console.log(date.toLocaleString("en-GB"))

    // TODO: check limit
    // TODO: check if already exists

    type = "nodewar"
    alerts = false
    mandatory = true
  } else {
    // 2b. DATE DOESN'T EXIST - ASK FOR PARAMS

    message.channel.send("What is the date of the event?");
    date = await validateResponseRegex(message, "Invalid date format", /^(?:(?:31(\/|-|.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g);
    if (date === "exit") {
      message.channel.send("Bye!");
      return;
    }

    message.channel.send('What time is the event?');
    hour = await validateResponseRegex(message, "Invalid time.", /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/g);
    if (hour === "exit") {
      message.channel.send("Bye!");
      return;
    }

    // set proper date
    date = new Date(date.split(/\D/g)[2], date.split(/\D/g)[1] - 1, date.split(/\D/g)[0], hour.split(":")[0], hour.split(":")[1]);
    // TODO: check limit
    // TODO: check if already exists

    message.channel.send('What is the type of the event? Possible types: "nodewar", "siege", "guildevent".');
    type = await validateResponse(message, "Invalid response (nodewar, siege, guildevent)", ['nodewar', 'siege', 'guildevent']);
    if (type === "exit") {
      message.channel.send("Bye!");
      return;
    }

    message.channel.send("Is the event mandatory (yes/no)?");
    mandatory = await validateResponse(message, "Invalid answer (yes/no).", ["yes", "no"]);
    if (mandatory === "exit") {
      message.channel.send("Bye!");
      return;
    }
    mandatory === "yes" ?
      mandatory = true
      :
      mandatory = false

    message.channel.send("Do you want to enable automatic alerts (yes/no)?");
    alerts = await validateResponse(message, "Invalid answer (yes/no).", ["yes", "no"]);
    if (alerts === "exit") {
      message.channel.send("Bye!");
      return;
    }
    alerts === "yes" ?
      alerts = true
      :
      alerts = false
  };

  // 3. SET MESSAGE CONTENT
  let content = "no description";
  message.channel.send("Do you want to create a custom message (yes/no)?");
  const contentResponse = await validateResponse(message, "Invalid answer (Valid options: yes/no).", ["yes", "no"]);

  switch (contentResponse) {
    case "exit": {
      message.channel.send("Bye!");
      return;
    }
    case "yes": {
      message.channel.send("Type in the content (max. 1024 characters allowed):")
      content = await validateContent(message)
      break;
    };
  };

  // 4. SEND MESSAGE TEMPLATE
  const embed = new Discord.MessageEmbed()
    .addField("Event:", type, false)
    .setDescription(mandatory ? "Mandatory" : "Non-mandatory")
    .addField("Date:", date.toLocaleDateString("en-GB"), true)
    .addField("Time:", hour, true)
    .addField("Details:", content, false)
    .addField("UNDECIDED:", 'null', false)
    .addField("Signed up:", `0/0`, true)
    .addField("Can\'t:", `0/0`, true)
    .addField("Undecided:", `0/0`, true)
    .setColor(mandatory ? "#ff0000" : "#58de49");


  // 5. CREATE ICONS
  const channel = await message.guild.channels.resolve(guildConfig.announcementsChannel);
  const reactionMessage = await channel.send(embed).catch(console.log);

  const messageId = reactionMessage.id;

  let emojis = [config.yesEmoji, config.noEmoji];

  for (item of emojis) {
    await reactionMessage.react(item);
  };

  // 6. ADD EVENT TO DB
  // a) axios call to save event
  let res
  try {
    res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/events',
      data: {
        date,
        type,
        mandatory,
        alerts,
        content,
        guild: guildConfig._id,
        messageId
      }
    });
  } catch (err) {
    message.channel.send("There was a problem with your request. Please, try again later.");
    console.log(err);
    return;
  }

  const event = res.data.data.event;

  // 7. UPDATE MESSAGE WITH REAL DATA
  await updateEventMessage(res, reactionMessage);


  // 8. CREATE LISTENER
  const filter = (reaction, user) => {
    if (!emojis.includes(reaction.emoji.name)) {
      let reactionMap = eventMessage.reactions.resolve(reaction.emoji.name);
      reactionMap?.users.remove(user.id);
    }
    return emojis.includes(reaction.emoji.name);
  }

  const collector = reactionMessage.createReactionCollector(filter, { dispose: true });
  collector.on('collect', async (reaction, user) => {

    const handleChangeGroup = async (goToGroup) => {
      try {
        const res = await axios.patch('http://localhost:3000/api/v1/events/change-group', {
          eventId: event._id,
          userDiscordId: user.id,
          goToGroup
        });

        await updateEventMessage(res, reactionMessage);

      } catch (err) {
        if (err.response.status !== 400) {
          user.send("There was a problem with your request. Please, try again later.");
        }
        console.log(err);
      }
    }

    switch (reaction.emoji.name) {
      case config.yesEmoji: {
        await handleChangeGroup("yes");
        break;
      };
      case config.noEmoji: {
        await handleChangeGroup("no");
        break;
      };
    };

    let reactionMap = reactionMessage.reactions.resolve(reaction.emoji.name);
    reactionMap?.users.remove(user.id);

  });


  // 9. INFORM THAT EVENT WAS CREATED
  const eventCreatedEmbed = new Discord.MessageEmbed()
    .setTitle("Event has been created")
    .setDescription(`[Link to the event post](${reactionMessage.url})`)
  message.channel.send(eventCreatedEmbed)

};


/*
TODO:
*/