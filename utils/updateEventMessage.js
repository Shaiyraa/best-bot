module.exports = async (event, eventMessage) => {

  // 2. Get additional required data
  const totalMemberCount = event.undecidedMembers.length + event.yesMembers.length + event.noMembers.length + event.waitlistedMembers.length;

  let undecidedMembersList = event.undecidedMembers.map(member => member.familyName);
  undecidedMembersList.length ? undecidedMembersList = undecidedMembersList.join(", ") : undecidedMembersList = "good job! no slackers on this event";

  let signupStatus = "CLOSED";
  if ((new Date(event.date).getTime() - new Date(Date.now()).getTime()) > 1 * 60 * 60 * 1000 && event.maxCount > event.yesMembers.length) {
    signupStatus = "OPEN";
  }

  const date = new Date(event.date).getTime() / 1000
  // 3a. Create new embed object
  const embed = {
    color: event.mandatory ? "#ff0000" : "#58de49",
    description: event.mandatory ? "Mandatory" : "Non-mandatory",
    footer: {
      text: `Signups ${signupStatus}`
    },
    fields: [{
      name: "Event:",
      value: event.type,
      inline: true,
    },
    {
      name: "Date:",
      value: `<t:${date}>`,
      inline: true,
    },
    {
      name: "Starts in:",
      value: `<t:${date}:R>`,
      inline: true,
    },
    {
      name: "Max. Attendance:",
      value: event.maxCount,
      inline: false,
    },
    {
      name: "Details:",
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
    groupObj[field.name] ? field.value = `\`\`\`${groupObj[field.name].join(", ")}\`\`\`` : field.value = "```empty```";
  });

  let waitlistedMembersList = "empty";
  if (event.waitlistedMembers.length) {
    waitlistedMembersList = event.waitlistedMembers.map(member => member.familyName).join(", ") || "empty";
  };

  let noMembersList = "empty"
  if (event.noMembers.length) {
    noMembersList = event.noMembers.map(member => member.familyName).join(", ") || "empty";
  };

  // 3d. define pa rotation field
  let paGroupsObj = {}
  if (event.yesMembers.length) {
    event.yesMembers.map(member => {
      // if user has PA assigned, push him to corresponding PA group
      if (member.paGroup) {
        if (!paGroupsObj[member.paGroup.name]) paGroupsObj[member.paGroup.name] = [];
        paGroupsObj[member.paGroup.name].push(member.familyName);
      }
    })
  }

  let paRotation = event.guild.paGroups.map(paGroup => {
    return `${paGroup.name.padEnd(10, " ")}: ${paGroupsObj[paGroup.name]?.length ? paGroupsObj[paGroup.name].join(", ") : "empty"}\n`
  })

  if (!paRotation.length) {
    paRotation = "empty";
  } else {
    paRotation = paRotation.join("");
  };

  groupFields.push({ name: "PA ROTATION", value: `\`\`\`fix\n${paRotation}\`\`\`` });

  // 3e. push other fields
  groupFields.push({ name: "WAITLIST", value: waitlistedMembersList.length > 1024 ? `${waitlistedMembersList.substring(0, 1021)}...` : waitlistedMembersList });

  groupFields.push({ name: "CAN\'T", value: noMembersList.length > 1024 ? `${noMembersList.substring(0, 1021)}...` : noMembersList });

  groupFields.push({ name: "UNDECIDED", value: undecidedMembersList.length > 1024 ? `${undecidedMembersList.substring(0, 1021)}...` : undecidedMembersList });

  // concat the arrays and put swap embed fields
  let arr = [];
  embed.fields = arr.concat(embed.fields, groupFields, signupFields);

  // 4. Update embed with new event data
  await eventMessage.edit({ embed });

};