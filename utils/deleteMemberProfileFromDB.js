const axios = require('axios');
const isUserInDB = require('./isUserInDB');

module.exports = async (memberId, guildId, deletedBy) => {
  // find user
  const user = await isUserInDB(memberId, guildId);
  if (!user) return false

  try {
    await axios.delete(`http://localhost:3000/api/v1/users/${user._id}?deletedBy=${deletedBy}`);
  } catch (err) {
    console.log(err);
    return false
  };
  return true
};