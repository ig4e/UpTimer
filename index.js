const prefix = '!';
const { Client, MessageEmbed, MessageAttachment, Collection} = require('discord.js');
//const quick = require('quick.db');
const { Database } = require('quickmongo');
const mongo = new Database(process.env['db']);
const botDB = mongo.createModel('bot');
mongo.on('ready', () => console.log('Database Ready !'));
const cmdCD = require('command-cooldown');
const client = new Client();
const prime = mongo.createModel('prime');
const lang = require('./Configs/lang.json');
const { MessageButton , MessageActionRow } = require("discord-buttons");
const timers = require('./Configs/config.json').timers;
const fs = require('fs');
require('discord-buttons')(client);
client.commands = new Collection();
require('./CommandsHandler.js')(client, ['Devs', 'General']);
const { upTime, get5ra, baseEmbed, urlCheck, normalizeF, formatTime, clearImgsDir } = require('./Functions/functions.js')(client, mongo);
const status = {
  glitchUp : false,
  replitUp : true,
  herokuUp : true
};
client.on('ready', async () => {
    let channel = client.channels.cache.get("895058968085405757")
    if (channel) channel.send("starting...")
    botDB.set('mainBot.lastestRestart', new Date());
    setTimeout(() => console.log('Ready.'), 250);
    setInterval(() => {
      let arr = [`${client.user.username} V2.5 !`, `NEW & IMPROVED !`, `${prefix}help`];
        client.user.setActivity(arr[Math.floor(Math.random() * arr.length)]);
    }, 25000);

    await upTime(await get5ra());
    upDate();
    setInterval( async () => {
      await upTime(await get5ra());
      upDate();
    }, timers.main.ims);
});


var tempBlackList = new Set();
client.on('message', async message => {
  if (message.channel.id == "854168359363674134" && message.author.id == "853650174798331904") status.glitchUp = true;
  message.content = message.content.toLowerCase();
    if (message.content == '!ad') {
        message.delete();
      let embed = baseEmbed(message)
.setDescription(`**بوت أبتايمر المخصص لابتايم بوتك 24/7 - <:speed:860590066437718017> 

- <:q_:860589479575158824> ما يميز البوت؟ :

<:star1:859694630378143764> سهولة في أستخدام الآوامر. \`- 1 \` 
<:true:859700876604211229> دعم الاوامر فى خاص البوت لاقصى خصوصية ممكنة. \`- 2 \` 
<:timer1:859694630349307944> مخصص فقط لتشغيل البوتات 24/7 ساعة. \`- 3 \` 
<:true:859700876604211229> دعم جميع الاستضافات مثل قلتش وريبل ات. \`- 4 \` 
<:setting:859694629905891409> تفاصيل دقيقة لجميع الروابط الخاصة بك (سرعة الاستجابة , الداون تايم  و نسب الاب تايم). \`- 5 \`
<:status:859694630240518174> رسم بياني لجميع روابط يبين سرعة الاستحابة والوقت. \`- 6 \` 
<:speed:860590066437718017> ابتايم سريع لكل رابط كل دقيقة. \`- 7 \` 
<:true:859700876604211229> و المزيد. \`- 8 \` 

الدعم الفني للبوت : [UpTimer™️ Support](https://discord.gg/ztwbWqUXHk)
اضافة البوت الى سيرفرك : [Add To Your Server](https://discord.com/oauth2/authorize?client_id=853650174798331904&permissions=2147974208&scope=bot)**`)
      .setFooter(message.guild.name+"'s Ad.", message.guild.iconURL());
      let BTN1 = new MessageButton().setLabel(lang.addbot).setStyle("url").setURL("https://discord.com/oauth2/authorize?client_id=853650174798331904&permissions=2147974208&scope=bot");
        let BTN2 = new MessageButton().setLabel(lang.servSupp).setStyle("url").setURL("https://discord.gg/XNE24XyT7B");
        let rowBtn = new MessageActionRow().addComponent(BTN1).addComponent(BTN2);
        return message.channel.send({
          component: rowBtn,
          embed:embed
        });
    }
    if (message.author.bot) return null;
    if (tempBlackList.has(message.author.id)) return null;
    let cmd = message.content.slice(prefix.length).toLowerCase().split(' ');
    if (cmd[0].length < 1) return null;
    let cd = await cmdCD.checkCoolDown(message.author.id);
    if (!cd.res.ready) {
      tempBlackList.add(message.author.id);
      if (cd.res.rem < (primeU ? timers.cds.low /2 : timers.cds.low)) {
        setTimeout (() => {tempBlackList.delete(message.author.id)},cd.res.rem);
      } else {
        setTimeout (() => {tempBlackList.delete(message.author.id)},primeU ? timers.cds.low /2 : timers.cds.low);
      }
      return message.channel.send(baseEmbed(message).setColor('YELLOW').setTitle("Cool Down !").setDescription(lang.coolDown.replace('<rem>', `${(cd.res.rem / 1000).toFixed(1)}s`)));
    }
    var primeU = await prime.get(`u_${message.author.id}`);
    if (message.content.replace("!", '').includes("<@853650174798331904>")) {
      message.channel.send(`**need help ?, use \`${prefix}help\`**`);
      cmdCD.addCoolDown(message.author.id, primeU ? (timers.cds.high /2)-500 : timers.cds.high);
    }
    if (!message.content.startsWith(prefix)) return null;
    let cmdA = message.content.split(" ")[0].slice(prefix.length);
    let cmdR = client.commands.find(cmd => cmd.info.name == cmdA || cmd.info.alis.includes(cmdA));
    if (cmdR) {
        cmdR.run(client, message, cmd, lang, prefix, primeU, mongo);
    };
});

async function upDate() {
    let total = {
      totalLinks: (await get5ra()).map(x => x.url).length
    };
    fs.writeFileSync('./Database/db.json', JSON.stringify(total));
}

let app = (require('express'))();
app.get('/', (req, res) => {
  res.sendStatus(200);
})
app.listen(3000);
client.login(process.env['token']);
setInterval(() => {
  client.login(process.env['token']);
}, 28800000);