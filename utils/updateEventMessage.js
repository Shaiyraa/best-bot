const Discord = require('discord.js');

module.exports = async (res, eventMessage) => {

  // 1. Get event data from axios response
  const event = res.data.data.event;

  // 2. Get additional required data
  const totalMemberCount = event.undecidedMembers.length + event.yesMembers.length + event.noMembers.length;

  let undecidedMembersList = event.undecidedMembers.map(member => member.familyName);
  undecidedMembersList.length ? undecidedMembersList = undecidedMembersList.join(", ") : undecidedMembersList = "good job! no slackers on this event";


  // 3a. Create new embed object
  const embed = {
    color: event.mandatory ? "#ff0000" : "#58de49",
    description: event.mandatory ? "Mandatory" : "Non-mandatory",
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
      name: "Details",
      value: event.content,
      inline: true,
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
  const groupFields = event.guild.groups.map(group => ({ name: group.name, value: [] }));

  let groupObj = {}
  if (event.yesMembers.length) {
    // loop through yesMembers
    event.yesMembers.map(member => {
      if (!groupObj[member.group.name]) groupObj[member.group.name] = []
      groupObj[member.group.name].push(member.familyName)
    })
    console.log(groupObj)


  };
  groupFields.map(field => {
    groupObj[field.name] ? field.value = groupObj[field.name].join(", ") : field.value = "empty"
  });

  groupFields.push({ name: "UNDECIDED", value: undecidedMembersList });

  // concat the arrays and put swap embed fields
  let arr = [];
  embed.fields = arr.concat(embed.fields, groupFields, signupFields);

  console.log(embed)

  // 4. Update embed with new event data
  await eventMessage.edit({ embed });

};



/*

  // 3a. Create new embed object
  const embed = {
    color: event.mandatory ? "#ff0000" : "#58de49",
    description: event.mandatory ? "Mandatory" : "Non-mandatory",
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
      name: "Details",
      value: event.content,
      inline: true,
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
  const groupFields = [];

  if (event.yesMembers.length) {
    // loop through yesMembers to see what groups to display
    let groupNames = []; // only to keep track of the groups
    event.yesMembers.forEach(member => {
      if (!groupNames.includes(member.group)) {
        groupNames.push(member.group);
        groupFields.push({ name: member.group, value: [] });
      };

      // push user's name to value array
      groupFields.map(group => {
        if (group.name === member.group) {
          group.value.push(member.familyName);
        };
      });
    });

    groupFields.map(group => {
      group.value = group.value.join(', ');
    });
  };

  groupFields.push({ name: "UNDECIDED", value: undecidedMembersList });

  // concat the arrays and put swap embed fields
  let arr = [];
  embed.fields = arr.concat(embed.fields, groupFields, signupFields);

 */