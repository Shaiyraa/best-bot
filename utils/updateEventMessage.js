const Discord = require('discord.js');

module.exports = async (event, eventMessage) => {

  // 2. Get additional required data
  const totalMemberCount = event.undecidedMembers.length + event.yesMembers.length + event.noMembers.length;

  let undecidedMembersList = event.undecidedMembers.map(member => member.familyName);
  undecidedMembersList.length ? undecidedMembersList = undecidedMembersList.join(", ") : undecidedMembersList = "good job! no slackers on this event";

  let signupStatus = "CLOSED";
  if ((new Date(event.date).getTime() - new Date(Date.now()).getTime()) > 1.5 * 60 * 60 * 1000 && event.maxCount > event.yesMembers.length) {
    signupStatus = "OPEN";
  }

  // 3a. Create new embed object
  const embed = {
    color: event.mandatory ? "#ff0000" : "#58de49",
    description: event.mandatory ? "Mandatory" : "Non-mandatory",
    footer: {
      text: `Signups ${signupStatus}`
    },
    fields: [{
      name: "Event",
      value: event.type,
      inline: false,
    },
    {
      name: "Date",
      value: new Date(event.date).toLocaleDateString("en-GB"),
      inline: true,
    },
    {
      name: "Time",
      value: event.hour,
      inline: true,
    },
    {
      name: "Max. Attendance",
      value: event.maxCount,
      inline: false,
    },
    {
      name: "Details",
      value: event.content
    }]
  };

  // 3b. Define signup fields
  const signupFields = [{
    name: "Signed up:",
    value: `${event.yesMembers.length}/${totalMemberCount}`,
    inline: true,
  },
  {
    name: "Can\'t:",
    value: `${event.noMembers.length}/${totalMemberCount}`,
    inline: true,
  },
  {
    name: "Undecided:",
    value: `${event.undecidedMembers.length}/${totalMemberCount}`,
    inline: true,
  }];

  // 3c. Define group fields          // TODO: make it more efficient
  let isDefaultNeeded = false // flag to display DEFAULT group
  const groupFields = event.guild.groups.map(group => ({ name: group.name, value: [] }));

  let groupObj = {};
  if (event.yesMembers.length) {
    // loop through yesMembers
    event.yesMembers.map(member => {
      if (!member.group) {
        member.group = { name: "DEFAULT" };
        isDefaultNeeded = true

      }
      if (!groupObj[member.group.name]) groupObj[member.group.name] = [];
      groupObj[member.group.name].push(member.familyName);
    });
  };

  // if theres a user without a group, create default one
  if (isDefaultNeeded) groupFields.push({ name: "DEFAULT", value: [] });

  groupFields.map(field => {
    groupObj[field.name] ? field.value = `\`\`\`${groupObj[field.name].join(", ")}\`\`\`` : field.value = "```empty```"
  });

  let noMembersList = "empty"
  if (event.noMembers.length) {
    noMembersList = event.noMembers.map(member => member.familyName).join(", ")
  }

  groupFields.push({ name: "CAN\'T", value: noMembersList });

  groupFields.push({ name: "UNDECIDED", value: undecidedMembersList });

  // concat the arrays and put swap embed fields
  let arr = [];
  embed.fields = arr.concat(embed.fields, groupFields, signupFields);

  // 4. Update embed with new event data
  await eventMessage.edit({ embed });

};