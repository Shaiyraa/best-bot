module.exports = async (message, roleId) => {
  const hasRole = message.member.roles.cache.find(r => r.id === roleId);
  return hasRole;
};