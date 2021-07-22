const axios = require('axios');

module.exports = async (guildId) => {

  // 1. FETCH ALL MEMBERS
  let res;
  try {
    res = await axios.get(`${process.env.API_URL}/api/v1/users/`, {
      guild: guildId
    });
  } catch (err) {
    return console.log(err);
  };

  if (!res.data.results) return;

  const members = res.data.data.users;

  // 2. DELETE PROFILES
  members.forEach(member => {
    console.log(`Deleting ${member.familyName}`)

    // TODO: uncomment me when going prod
    //deleteMemberProfileFromDB(member.id, guildId, "bot");
  });
};