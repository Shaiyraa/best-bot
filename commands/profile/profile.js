const createProfile = require("./createProfile");
const showProfile = require("./showProfile");
const editProfile = require("./editProfile");
const sendEmbedMessage = require("../../utils/sendEmbedMessage");

module.exports.run = async (bot, message, args) => {

  switch (args[0]) {
    case "create": {
      createProfile(message);
      break;
    };
    case "show": {
      showProfile(message, args[1]);
      break;
    };
    case "edit": {
      editProfile(message, args[1], args[2]); // ?profile edit eva 234 || if params are empty, ask what to update
      break;
    };
    default: {
      sendEmbedMessage(message.channel, "Options:", [
        "?profile create - to create new profile",
        "?profile show [discord name / family name] - to show member's profile; use without [name] to see your own profile",
        "?profile update - to update existing profile", "?profile delete - to delete your profile"
      ]);
    };
  };
};

module.exports.help = {
  name: "profile",
  description: "asd"
};