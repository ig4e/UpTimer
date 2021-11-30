const config = require('../../Configs/config.json');
const { Link, Request, PrimeUser } = require('../../Classes/Classes.js');
const timers = config.timers;
const { MessageButton , MessageActionRow } = require("discord-buttons");
const cmdCD = require('command-cooldown');

module.exports = {
    info: {
        name: 'transfer',
        alis : ['trans'],
        description: '',
    },
	async run(client, message, cmd, lang, prefix, primeU , mongo) {
        const { upTime, get5ra, baseEmbed, urlCheck, normalizeF, formatTime } = require('../../Functions/functions.js')(client, mongo);
        const db = await mongo.createModel('data');
        cmdCD.addCoolDown(message.author.id, primeU ? (timers.cds.high /2)-1500 : timers.cds.high);
        let url = cmd[1];
        let newOwner = message.mentions.users.first();
        if (!url) return message.channel.send(baseEmbed(message).setColor('YELLOW').setDescription(lang.noLinkR.replace('!remove', "!transfer").replace('<link>', `<link> @mention`)));
        if (!newOwner) return message.channel.send(baseEmbed(message).setColor('YELLOW').setDescription(lang.noMention.replace('@mention', `@${message.author.username}`)));
        if (urlCheck(url)) return message.channel.send(baseEmbed(message).setColor('YELLOW').setDescription(lang.invaildLinkR.replace('!remove', "!transfer")));
        let id = url.replace('https://',"").replace('http://',"").replace('/',"").split('.')[0];
        let ownedProjects = (await get5ra()).filter(x => x.owner == newOwner.id);
        if (!(ownedProjects.length <= 5) && !primeU) return message.channel.send(baseEmbed(message).setColor('YELLOW').setDescription(lang.noSpaceFree.replace('you', newOwner.username)));
        if (!(ownedProjects.length <= 15) && !primeU) return message.channel.send(baseEmbed(message).setColor('YELLOW').setDescription(lang.noSpacePrime.replace('you', newOwner.username)));
        if ((await db.get(id))) {
            if ((await db.get(id)).owner != message.author.id) return message.channel.send(baseEmbed(message).setTitle('<:false:859700876183994400> Failed | '+lang.eowner).setColor('#ff0000'));
            if (newOwner.id == message.author.id) return message.channel.send(baseEmbed(message).setColor('YELLOW').setDescription(lang.transferToYourself));
            let msg = await message.channel.send(baseEmbed(message).setColor('YELLOW').setDescription(lang.transferVref));
            await msg.react('🟢');
            await msg.react('🔴');
            let collector = msg.createReactionCollector((reaction, user) => (reaction.emoji.name === '🟢' || reaction.emoji.name === '🔴') && user.id === message.author.id, { time: timers.rcet.mid, max : 1 });
            collector.on('collect', async (reaction, user) => {
                if (reaction.emoji.name === '🟢') {
                  await db.set(`${id}.owner`, newOwner.id);
                  await message.channel.send(baseEmbed(message).setTitle('<:true:859700876604211229> Done | '+(lang.transferd.replace('<newOwner>', newOwner.tag))));
                  await msg.delete();
                } else {
                  await msg.delete();
                }
            });
            collector.on('end', async (coll, reason) => {
              if (reason == 'newp') return;
              if (coll.size < 1) await msg.reactions.removeAll();
            });
        } else {
          return message.channel.send(baseEmbed(message).setColor('YELLOW').setDescription(lang.invaildLinkG));
        }
    }
}