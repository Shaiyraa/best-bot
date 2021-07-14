const Discord = require("discord.js");
const fs = require("fs");
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' })

const setEventListenersAndScheduleAlerts = require('./setEventListenersAndScheduleAlerts');
const config = require("./config.json");

// create bot
const bot = new Discord.Client({ disableEveryone: true });

bot.on("ready", async () => {
  bot.user.setActivity('type ?help', { type: 'PLAYING' })
  await setEventListenersAndScheduleAlerts(bot).catch(console.log)
})

// create commands
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
  if (err) console.log(err);

  if (files.length <= 0) {
    console.log("Couldn't find commands.");
    return;
  };

  files.forEach((command) => {
    let props = require(`./commands/${command}/${command}.js`);
    bot.commands.set(props.help.name, props);
  });
});


//Command Manager
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;

  // easter egg
  if (message.content?.toLowerCase() === "good bot") {
    message.channel.send("^^");
    return;
  }

  let prefix = config.prefix;

  //Check for prefix
  if (!message.content.startsWith(prefix)) {
    return;
  }

  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if (commandfile) {
    await commandfile.run(bot, message, args);
  } else {
    message.channel.send("I don't recognize this command.")
  }
});


bot.login(process.env.DISCORD_TOKEN)
/*

TODO:
- config, but making sure that the person using the command is an officer

- create event, again, by officer only
*/
