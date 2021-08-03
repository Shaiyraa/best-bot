const Discord = require("discord.js");
const axios = require('axios');
const QuickChart = require('quickchart-js');
const logger = require('../../logger');
const config = require('../../config.json');

module.exports = async (message, guildConfig, groupName) => {

  let members;
  if (groupName) {
    // 1. find the id of the group looping through guildconfig.groups
    const groups = guildConfig.groups.filter(group => group.name === groupName.toUpperCase())
    const group = groups[0]
    if (!group) return message.channel.send("This group doesn't exist.");
    // 2. find users with the role id
    let resUsers;
    try {
      resUsers = await axios.get(`${process.env.API_URL}/api/v1/users?guild=${guildConfig._id}&group=${group._id}&sort=gearscore`);
      if (!resUsers.data.results) return message.channel.send("No users belonging to this group found.");
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
    members = resUsers.data.data.users;

  } else {
    // find all users within the guild
    let resUsers;
    try {
      resUsers = await axios.get(`${process.env.API_URL}/api/v1/users?guild=${guildConfig._id}&sort=gearscore`);
      if (!resUsers.data.results) return message.channel.send("No users belonging to this group found.");
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
    members = resUsers.data.data.users;
  }

  if (!members.length) return message.channel.send("No users to display.")

  // count class count
  let classes = {};
  let gearscore = 0;
  let ap = 0;
  let aap = 0;
  let dp = 0;
  let divider = 0;

  let gearscoreShai = 0;
  let apShai = 0;
  let aapShai = 0;
  let dpShai = 0;

  const gsObj = {
    lt620: 0,
    plus620: 0,
    plus630: 0,
    plus650: 0,
    plus660: 0,
    plus670: 0,
    plus680: 0,
    plus690: 0,
    plus700: 0,
  }

  members.forEach(member => {
    if (classes[member.characterClass]) {
      classes[member.characterClass] = classes[member.characterClass] + 1;
    } else {
      classes[member.characterClass] = 1;
    };

    gearscoreShai = gearscoreShai + member.gearscore;
    apShai = apShai + member.regularAp;
    aapShai = aapShai + member.awakeningAp;
    dpShai = dpShai + member.dp;

    if (member.characterClass !== "shai") {
      gearscore = gearscore + member.gearscore;
      ap = ap + member.regularAp;
      aap = aap + member.awakeningAp;
      dp = dp + member.dp;
      divider = divider + 1
    };

    if (member.gearscore >= 700) {
      gsObj.plus700 = gsObj.plus700 + 1
    } else if (member.gearscore >= 690) {
      gsObj.plus690 = gsObj.plus690 + 1
    } else if (member.gearscore >= 680) {
      gsObj.plus680 = gsObj.plus680 + 1
    } else if (member.gearscore >= 670) {
      gsObj.plus670 = gsObj.plus670 + 1
    } else if (member.gearscore >= 660) {
      gsObj.plus660 = gsObj.plus660 + 1
    } else if (member.gearscore >= 650) {
      gsObj.plus650 = gsObj.plus650 + 1
    } else if (member.gearscore >= 630) {
      gsObj.plus630 = gsObj.plus630 + 1
    } else if (member.gearscore >= 620) {
      gsObj.plus620 = gsObj.plus620 + 1
    } else {
      gsObj.lt620 = gsObj.lt620 + 1
    }
  });

  // make class array into two columns
  let classesArray = []
  for (i = 0; i <= config.classes.length - 1; i = i + 2) {
    let firstItem = `${config.classes[i].padEnd(19, ' ')} ${classes[config.classes[i]] ? classes[config.classes[i]] : 0}`
    let secondItem = config.classes[i + 1] ? ` | ${config.classes[i + 1].padEnd(19, ' ')} ${classes[config.classes[i + 1]] ? classes[config.classes[i + 1]] : 0}\n` : ""
    classesArray.push(`${firstItem}${secondItem}`)
  }
  classesArray = classesArray.join("");

  // count avg ap/aap/dp/gs
  gearscore = Math.floor(gearscore / divider * 100) / 100;
  ap = Math.floor(ap / divider * 100) / 100;
  aap = Math.floor(aap / divider * 100) / 100;
  dp = Math.floor(dp / divider * 100) / 100;

  // count avg ap/aap/dp/gs shai
  gearscoreShai = Math.floor(gearscoreShai / members.length * 100) / 100;
  apShai = Math.floor(apShai / members.length * 100) / 100;
  aapShai = Math.floor(aapShai / members.length * 100) / 100;
  dpShai = Math.floor(dpShai / members.length * 100) / 100;

  //let undergearedGSArray = [`${"<FAMILY NAME>".padEnd(23, ' ')} ${"<GS>".padEnd(5, ' ')} ${"<AP>".padEnd(5, ' ')} ${"<AAP>".padEnd(5, ' ')} ${"<DP>".padEnd(5, ' ')}\n`]

  // // form a list of ppl that have:
  // members.forEach(member => {
  //   if(member.gearscore < gearscore) undergearedGSArray.push(`${member.familyName.padEnd(23, ' ')} ${member.gearscore.toString().padEnd(5, ' ')} ${member.regularAp.toString().padEnd(5, ' ')} ${member.awakeningAp.toString().padEnd(5, ' ')} ${member.dp.toString().padEnd(5, ' ')}\n`)
  //    })

  // CREATE A GS CHART
  const gsChart = new QuickChart();
  gsChart
    .setConfig({
      type: 'doughnut',
      data: {
        labels: ['<620', '620+', '630+', '650+', '660+', '670+', '680+', '690+', '700+'],
        datasets: [{
          data: [gsObj.lt620, gsObj.plus620, gsObj.plus630, gsObj.plus650, gsObj.plus660, gsObj.plus670, gsObj.plus680, gsObj.plus690, gsObj.plus700],
          backgroundColor: ["rgb(235, 42, 42)", "rgb(235, 113, 42)", "rgb(235, 209, 42)", "rgb(151, 235, 42)", "rgb(16, 204, 41)", "rgb(16, 204, 173)", "rgb(16, 123, 204)", "rgb(32, 16, 204)", "rgb(148, 19, 191)"]
        }],
      },
      options: {
        legend: {
          labels: {
            fontColor: "#fff",
            fontSize: 14
          }
        },
        plugins: {
          datalabels: {
            display: true,
            color: '#fff',
            backgroundColor: '#2c2f33',
            borderRadius: 5
          },
          // doughnutlabel: {
          //   labels: [{
          //     text: '550',
          //     font: {
          //       size: 20,
          //       weight: 'bold'
          //     }
          //   }, {
          //     text: 'average'
          //   }]
          // }
        }
      }
    })
    .setBackgroundColor('#2c2f33')

  const embed = new Discord.MessageEmbed()
    .setTitle(groupName ? `Stats for ${groupName.toUpperCase()} group` : "Stats for the entire guild")
    .addField("Total People:", members.length, true)
    .addField("Avg. GS:", gearscore, true)
    .addField("Avg. GS w/ shai:", gearscoreShai, true)
    .addField("Classes:", `\`\`\`css\n${classesArray}\`\`\``, false)
    .addField("AP:", ap, true)
    .addField("AAP:", aap, true)
    .addField("DP:", dp, true)
    .addField("AP w/ shai:", apShai, true)
    .addField("AAP w/ shai:", aapShai, true)
    .addField("DP w/ shai:", dpShai, true)
    //.addField("Ppl below average GS:", `\`\`\`css\n${undergearedGSArray.join("")}\`\`\``, false)
    .setColor("RANDOM")
    .setImage(gsChart.getUrl())

  message.channel.send(embed);


  // react with some emoji
  // set event listener to display the list of undergeared ppl in a normal message (embed too smol)
}