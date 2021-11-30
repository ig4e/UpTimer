const lang = require('../../Configs/lang.json');
const config = require('../../Configs/config.json');
const { Link, Request, PrimeUser } = require('../../Classes/Classes.js');
const timers = config.timers;
const pings = config.config;
const { MessageButton , MessageActionRow } = require("discord-buttons");
const cmdCD = require('command-cooldown');

module.exports = {
    info: {
        name: 'about',
        alis : [],
        description: '',
    },
	async run(client, message, cmd, lang, prefix, primeU , mongo) {
        const { upTime, get5ra, baseEmbed, urlCheck, normalizeF, formatTime } = require('../../Functions/functions.js')(client, mongo);
        const botDB = await mongo.createModel('bot');
        let botdb = await botDB.get("mainBot");
        let totalLinks = require('../../Database/db.json').totalLinks;
        let totalReq = Number(botdb.totalReq.up) + Number(botdb.totalReq.down);
        cmdCD.addCoolDown(message.author.id, primeU ? (timers.cds.low /2)-500 : timers.cds.low);
        let BTN1 = new MessageButton().setLabel(lang.addbot).setStyle("url").setURL("https://discord.com/oauth2/authorize?client_id=853650174798331904&permissions=2147974208&scope=bot");
        let BTN2 = new MessageButton().setLabel(lang.servSupp).setStyle("url").setURL("https://discord.gg/XNE24XyT7B");
        let rowBtn = new MessageActionRow().addComponent(BTN1).addComponent(BTN2);
        return message.channel.send({
          component: rowBtn,
          embed:baseEmbed(message).setTitle(`About Me`).setDescription(`**================ My Devs ================\n\n<:users:859700876565807104> | Sekai966 - <@709554047585222707>\n<:users:859700876565807104> | iiDeath27 - <@451474312306622489>\n\n================ My Info =================\n\n<:ping:859322141556473876> | Ping : \`${client.ws.ping}\`ms\n<:users:859700876565807104> | Total Users : \`${client.users.cache.size}\`\n<:timer1:859694630349307944> |  Uptime Every : \`${timers.main.timer}m\`\n<:status:859694630240518174> | Total Links : \`${totalLinks}\`\n<:status:859694630240518174> |  Total Requests : \`${totalReq}\`\n\n=======================================**`)
        });
    }
}