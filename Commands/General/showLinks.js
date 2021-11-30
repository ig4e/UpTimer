const lang = require('../../Configs/lang.json');
const config = require('../../Configs/config.json');
const { Link, Request, PrimeUser } = require('../../Classes/Classes.js');
const timers = config.timers;
const pings = config.config;
const { MessageButton , MessageActionRow } = require("discord-buttons");
const cmdCD = require('command-cooldown');

module.exports = {
    info: {
        name: 'links',
        alis : ["show links"],
        description: 'Adds ',
    },
	async run(client, message, args, lang, prefix, primeU , mongo) {
        const { upTime, get5ra, baseEmbed, urlCheck, normalizeF, formatTime } = require('../../Functions/functions.js')(client, mongo);
        let waitm = await message.author.send(baseEmbed(message).setTitle(`${lang.loading}`).setColor("GREEN"));
        const db = await mongo.createModel('data');
        cmdCD.addCoolDown(message.author.id, primeU ? (timers.cds.mid /2)-500 : timers.cds.mid);
        let data = await get5ra();
        if (!data) return waitm.edit(baseEmbed(message).setTitle(`<:false:859700876183994400> Error | something went wrong please try again`).setColor('RED'));
        let ownedProjects = (data).filter(x => x.owner == message.author.id);
        let msg = await waitm.edit({
          embed:  baseEmbed(message).setDescription(ownedProjects.length > 0 ? ownedProjects.map(x => `**${ownedProjects.findIndex(u => u.url == x.url)} - \\${x.paused ? '🔴' : '🟢'} | ${x.url}**`).join('\n') : lang.noLinks)
          .setColor(ownedProjects.length > 0 ? "GREEN" : "YELLOW").setTitle(`Your Current Links !`)
        });
        msg.react('')

        return msg;
    }
}