const Discord = require("discord.js");
const axios = require('axios');
const config = require('../../config.json');

module.exports = async (message, guildConfig, groupName) => {

  let members;
  if(groupName) {
    // 1. find the id of the group looping through guildconfig.groups
    const groups = guildConfig.groups.filter(group => group.name === groupName.toUpperCase())
    const group = groups[0]
    if(!group) return message.channel.send("This group doesn't exist.");
    // 2. find users with the role id
    let resUsers;
    try {
    resUsers = await axios.get(`${process.env.API_URL}/api/v1/users?guild=${guildConfig._id}&group=${group._id}&sort=gearscore`);
    if(!resUsers.data.results) return message.channel.send("No users belonging to this group found.");
    } catch (err) {
      console.log(err)
      return message.channel.send("There was a problem with your request. Please, try again later.");
    };
    members = resUsers.data.data.users;

  } else {
     // find all users within the guild
     let resUsers;
    try {
    resUsers = await axios.get(`${process.env.API_URL}/api/v1/users?guild=${guildConfig._id}&sort=gearscore`);
    if(!resUsers.data.results) return message.channel.send("No users belonging to this group found.");
    } catch (err) {
      console.log(err)
      return message.channel.send("There was a problem with your request. Please, try again later.");
    };
    members = resUsers.data.data.users;
  }

  // count class count
  let classes = {};
  let gearscore = 0;
  let ap = 0;
  let aap = 0;
  let dp = 0;
  let divider = 0;

  members.forEach(member => {
    if(classes[member.characterClass]) {
      classes[member.characterClass] = classes[member.characterClass] + 1;
    } else {
      classes[member.characterClass] = 1;
    };

    if(member.characterClass !== "shai") {
      gearscore = gearscore + member.gearscore;
      ap = ap + member.regularAp;
      aap = aap + member.awakeningAp;
      dp = dp + member.dp;
      divider = divider + 1
    };
  });

  // make class array into two columns
  let classesArray = []
  for (i = 0; i <= config.classes.length - 1; i=i+2) {
    let firstItem = `${config.classes[i].padEnd(19, ' ')} ${classes[config.classes[i]] ? classes[config.classes[i]] : 0}`
    let secondItem = config.classes[i+1] ? ` | ${config.classes[i+1].padEnd(19, ' ')} ${classes[config.classes[i+1]] ? classes[config.classes[i+1]] : 0}\n` : ""
    classesArray.push(`${firstItem}${secondItem}`)
  }

  //let classesArray = config.classes.map(characterClass => `${characterClass.padEnd(12, ' ')} ${classes[characterClass] ? classes[characterClass] : 0}\n`);
  classesArray = classesArray.join("");

  // count avg ap/aap/dp/gs
  gearscore = Math.floor(gearscore / divider * 100) / 100;
  ap = Math.floor(ap / divider * 100) / 100;
  aap = Math.floor(aap / divider * 100) / 100;
  dp = Math.floor(dp / divider * 100) / 100;

  //let undergearedGSArray = [`${"<FAMILY NAME>".padEnd(23, ' ')} ${"<GS>".padEnd(5, ' ')} ${"<AP>".padEnd(5, ' ')} ${"<AAP>".padEnd(5, ' ')} ${"<DP>".padEnd(5, ' ')}\n`]

  // // form a list of ppl that have:
  // members.forEach(member => {
  //   if(member.gearscore < gearscore) undergearedGSArray.push(`${member.familyName.padEnd(23, ' ')} ${member.gearscore.toString().padEnd(5, ' ')} ${member.regularAp.toString().padEnd(5, ' ')} ${member.awakeningAp.toString().padEnd(5, ' ')} ${member.dp.toString().padEnd(5, ' ')}\n`)
  //    })

  const embed = new Discord.MessageEmbed()
    .setTitle(groupName ? `Stats for ${groupName.toUpperCase()} group` : "Stats for the entire guild")
    .addField("Total People:", members.length, true)
    .addField("Avg. GS:", gearscore, true)
    .addField("Classes:", `\`\`\`css\n${classesArray}\`\`\``, false)
    .addField("AP:", ap, true)
    .addField("AAP:", aap, true)
    .addField("DP:", dp, true)
    //.addField("Ppl below average GS:", `\`\`\`apache\n${undergearedGSArray.join("")}\`\`\``, false)
    .setColor("RANDOM")
    .setFooter("shais are not counted into the stats");

  message.channel.send(embed);


  // react with some emoji
  // set event listener to display the list of undergeared ppl in a normal message (embed too smol)
}