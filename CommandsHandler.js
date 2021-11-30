module.exports = (client, arr) => {
  const { readdirSync } = require("fs");
  const load = dirs => {
    const commands = readdirSync(`./Commands/${dirs}`).filter(d => d.endsWith('.js'));
      for (let file of commands) {
        let pull = require(`./Commands/${dirs}/${file}`);
        if (pull.info) {
            client.commands.set(pull.info.name, pull, pull.info.alis);
        };
      };
  };
  arr.forEach(x => load(x));
};