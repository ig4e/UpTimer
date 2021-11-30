const quick = require('quick.db');
const lang = require('../../Configs/lang.json');
const config = require('../../Configs/config.json');
const { Link, Request, PrimeUser } = require('../../Classes/Classes.js');
const timers = config.timers;
const pings = config.config;
const { MessageButton , MessageActionRow } = require("discord-buttons");
const cmdCD = require('command-cooldown');
const db = new quick.table('data');

module.exports = {
    info: {
        name: 'ping',
        alis : [],
        description: '',
    },
	async run(client, message, args, lang, prefix, primeU, mongo) {
          const { upTime, get5ra, baseEmbed, urlCheck, normalizeF, formatTime } = require('../../Functions/functions.js')(client, mongo);
        cmdCD.addCoolDown(message.author.id, primeU ? (timers.cds.mid /2)-500 : timers.cds.mid);
        return message.channel.send(baseEmbed(message).setDescription(`**<:ping:859322141556473876> | My Ping : \`${client.ws.ping}ms\`**`));
    }
}