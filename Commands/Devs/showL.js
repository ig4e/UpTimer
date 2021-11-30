const lang = require('../../Configs/lang.json');
const config = require('../../Configs/config.json');
const { Link, Request, PrimeUser } = require('../../Classes/Classes.js');
const timers = config.timers;
const pings = config.config;
const { MessageButton , MessageActionRow } = require("discord-buttons");
const cmdCD = require('command-cooldown');

module.exports = {
    info: {
        name: 'show',
        alis : ['sl'],
        description: '',
    },
	async run(client, message, cmd, lang, prefix, primeU , mongo) {
        const db = await mongo.createModel('data');
        const prime = await mongo.createModel('prime');
        const { upTime, get5ra, baseEmbed, urlCheck, normalizeF, formatTime } = require('../../Functions/functions.js')(client, mongo);
        if (!["451474312306622489","436231895651450890"].includes(message.author.id)) return;
        message.channel.send(
          (await get5ra()).map(x => {
            let name = client.users.cache.get(x.owner) ? client.users.cache.get(x.owner).username : x.owner;
            return `Author : ${name}\n ${x.url}`
          }), {split : true, code: true}
        ).catch( (err) => message.channel.send(err));
    }
}