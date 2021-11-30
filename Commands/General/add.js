const lang = require('../../Configs/lang.json');
const config = require('../../Configs/config.json');
const { Link, Request, PrimeUser } = require('../../Classes/Classes.js');
const timers = config.timers;
const pings = config.config;
const { MessageButton , MessageActionRow } = require("discord-buttons");
const cmdCD = require('command-cooldown');

module.exports = {
    info: {
        name: 'add',
        alis : [],
        description: 'Adds ',
    },
	async run(client, message, args, lang, prefix, primeU , mongo) {
        const { upTime, get5ra, baseEmbed, urlCheck, normalizeF, formatTime } = require('../../Functions/functions.js')(client, mongo);
        let waitm = await message.channel.send(baseEmbed(message).setTitle(`${lang.loading}`).setColor("GREEN"));
        const db = await mongo.createModel('data');
        cmdCD.addCoolDown(message.author.id, primeU ? (timers.cds.mid /2)-500 : timers.cds.mid);
        let url = args[1];
        if (!url) return waitm.edit(baseEmbed(message).setColor('YELLOW').setDescription(lang.noLink));
        if (urlCheck(url)) return waitm.edit(baseEmbed(message).setColor('YELLOW').setDescription(lang.invaildLink));
        let id = url.replace('https://',"").replace('http://',"").replace('/',"").split('.')[0];
        let ownedProjects = (await get5ra()).filter(x => x.owner == message.author.id);
        //if (!(ownedProjects.length <= 10) && !primeU) return waitm.edit(baseEmbed(message).setColor('YELLOW').setDescription(lang.noSpaceFree));
        //if (!(ownedProjects.length <= 20) && !primeU) return waitm.edit(baseEmbed(message).setColor('YELLOW').setDescription(lang.noSpacePrime));
        if ((await db.get(id))) {
            if ((await db.get(id)).owner == message.author.id) return waitm.edit(baseEmbed(message).setTitle('<:false:859700876183994400> Failed | '+lang.alreadyAdded).setColor('YELLOW'));
            if ((await db.get(id)).owner !== message.author.id) return waitm.edit(baseEmbed(message).setTitle('<:false:859700876183994400> Failed | '+lang.eowner).setColor('#ff0000'));
            return waitm.edit(baseEmbed(message).setColor('YELLOW').setDescription(lang.dubLink));
        }
        await db.set(id,new Link(url,message.author.id));
        upTime(await get5ra());
        return waitm.edit(baseEmbed(message).setTitle('<:true:859700876604211229> Done | '+lang.add));
    }
}