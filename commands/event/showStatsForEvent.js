const Discord = require('discord.js');
const config = require('../../config.json');

module.exports = async (message, guildConfig, event) => {

  // 1. GATHER ALL THE INFO NEEDED 
  const totalMemberCount = event.undecidedMembers.length + event.yesMembers.length + event.noMembers.length;
  let undecidedFamilyNames = event.undecidedMembers.map(member => member.familyName).join(", ")

  if(!undecidedFamilyNames.length) undecidedFamilyNames = "No slackers on this event!"

  // 2. COUNT AVG STATS 
  let classes = {};
  let gearscore = 0;
  let ap = 0;
  let aap = 0;
  let dp = 0;
  let divider = 0;

  event.yesMembers.forEach(member => {
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


  let classesArray = []
  for (i = 0; i <= config.classes.length - 1; i=i+2) {
    let firstItem = `${config.classes[i].padEnd(16, ' ')} ${classes[config.classes[i]] ? classes[config.classes[i]] : 0}`
    let secondItem = config.classes[i+1] ? ` | ${config.classes[i+1].padEnd(16, ' ')} ${classes[config.classes[i+1]] ? classes[config.classes[i+1]] : 0}\n` : ""
    classesArray.push(`${firstItem}${secondItem}`)
  }
  classesArray = classesArray.join("");

  gearscore = Math.floor(gearscore / divider * 100) / 100;
  ap = divider !== 0 ? Math.floor(ap / divider * 100) / 100 : 0;
  aap = divider !== 0 ?  Math.floor(aap / divider * 100) / 100 : 0;
  dp = divider !== 0 ?  Math.floor(dp / divider * 100) / 100 : 0;

  // 3. SEND EMBED
  const date = new Date(event.date)

  const embed = new Discord.MessageEmbed()
      .setTitle("Stats for archived event:")
      .addField("Event:", event.type, true)
      .setDescription(event.mandatory ? "Mandatory" : "Non-mandatory")
      .addField("Date:", `<t:${date.getTime() / 1000}>`, true)
      .addField("Ended:", `<t:${date.getTime() / 1000}:R>`, true)
      //.addField("Victory:", `no info`, false)
      .addField("Signed up:", `${event.yesMembers.length}/${totalMemberCount}`, true)
      .addField("Can\'t:", `${event.noMembers.length}/${totalMemberCount}`, true)
      .addField("Undecided:", `${event.undecidedMembers.length}/${totalMemberCount}`, true)
      .addField("Undecided - family names:", `\`\`\`${undecidedFamilyNames}\`\`\``, false)
      .addField("Avg. AP", ap, true)
      .addField("Avg. AAP", aap, true)
      .addField("Avg. DP", dp, true)
      .addField("Classes that attended:", `\`\`\`css\n${classesArray}\`\`\``, false)
      .setColor("RANDOM");
    // send message
    const reactionMessage = await message.channel.send(embed);
}