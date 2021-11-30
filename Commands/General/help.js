const quick = require('quick.db');
const lang = require('../../Configs/lang.json');
const config = require('../../Configs/config.json');
const { Link, Request, PrimeUser } = require('../../Classes/Classes.js');
const timers = config.timers;
const pings = config.config;
const { MessageButton , MessageActionRow } = require("discord-buttons");
const cmdCD = require('command-cooldown');

module.exports = {
    info: {
        name: 'help',
        alis : ['h'],
        description: '',
    },
	async run(client, message, cmd, lang, prefix, primeU , mongo) {
        const { upTime, get5ra, baseEmbed, urlCheck, normalizeF, formatTime } = require('../../Functions/functions.js')(client, mongo);
        let BTN1 = new MessageButton().setLabel(lang.addbot).setStyle("url").setURL("https://discord.com/oauth2/authorize?client_id=853650174798331904&permissions=2147974208&scope=bot");
        let BTN2 = new MessageButton().setLabel(lang.servSupp).setStyle("url").setURL("https://discord.gg/XNE24XyT7B");
        let rowBtn = new MessageActionRow().addComponent(BTN1).addComponent(BTN2);
        cmdCD.addCoolDown(message.author.id, primeU ? (timers.cds.low /2)-500 : timers.cds.low);
        return message.channel.send({
            component: rowBtn,
            embed: baseEmbed(message).setTitle(`My Commands`).setDescription(`**========= My Info =========\n\n\`!about\` | About me.\n\`!ping\` | My ping.\n\n========= My Commands =========\n\n\`!me / !status\` | Displays your links and manage them too.\n\`!add <link>\` |  Adds a link to the uptimer.\n\`!remove <link>\` |  Removes a link from the uptimer.\n\`!transfer <link>\` |  Transfers link ownership to another discord account/user.\n**`)
        });
    }
}