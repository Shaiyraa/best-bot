const confirmation = async (message) => {
  let value = false;
  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
    .then(async m => {
      m = m.first();
      if (m.content.toLowerCase() === "yes" || m.content.toLowerCase() === "ye" || m.content.toLowerCase() === "y") {
        value = true;
      };
    })
    .catch((err) => {
      console.log(err);
      message.channel.send("There was a problem with your request. Please, try again later.");
    });

    return value;
}

module.exports = confirmation;