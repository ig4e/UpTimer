module.exports = (client, quick) => {
const { readdirSync } = require("fs");
const fs = require("fs");
const flip = (a, b) => b.time - a.time;
const { Link, Request, PrimeUser } = require('../Classes/Classes.js');
client.on('ready', () => {clearImgsDir();console.log('Functions Loaded !')});
const fetch = require('node-fetch');
const Canvas = require('canvas');
const moment = require('moment');
const { Database } = require('quickmongo');
const db = quick.createModel('data');
const botDB = quick.createModel('bot');
const { MessageEmbed, MessageAttachment, Collection } = require('discord.js');
const lang = require('../Configs/lang.json');
const config = require('../Configs/config.json');
const timers = config.timers;
const pings = config.config;

/*botDB.set("mainBot", {
  totalReq: {
    up: 0,
    down: 0
  },
  lastestRestart: new Date()
});*/

async function upTime(array) {
    let channel = await client.channels.cache.get("860735217505140757");
    let upDate = new Date();
    let res = await array.map(async linkD => {
        if (!linkD) return null;
        if (!linkD.url) return null;
        if (linkD.paused) return "paused";
        let status = true;
        let id = linkD.url.replace('https://',"").replace('http://',"").replace('/',"").split('.')[0];
              if (linkD.all.length >= 60) await db.delete(`${id}`).then(x => console.log('deleted'));
              linkD.all = linkD.all.sort((a, b) => b.time - a.time).slice(0, 35);
          await fetch(linkD.url.replace("https", "http")).then(async res => {
              if (res.ok) {
                let spoofedPing = Math.floor(Math.random() * pings.pings.max);
                if (spoofedPing == 0) spoofedPing += pings.pings.fadd;
                if (spoofedPing < pings.pings.lowest) spoofedPing += pings.pings.add;
                let getDb = await db.get(id)
                if (!getDb) await db.set(id,linkD);
                  linkD.up = [];
                  linkD.all.push(new Request(spoofedPing,upDate,res.status,res.statusText, false));
                  linkD.totalReq.up++;
                  await botDB.add('mainBot.totalReq.up', 1).then(async x => await botDB.set(`mainBot`, x));
                  await db.set(`${id}`, linkD);
              } else if (!res.ok) {
                let getDb = await db.get(id)
                if (!getDb) await db.set(id,linkD);
                  status = false
                  linkD.down = [];
                  linkD.all.push(new Request(null,upDate,res.status,res.statusText, true));
                  linkD.totalReq.down++;
                  botDB.add('mainBot.totalReq.down', 1).then(async x => await botDB.set(`mainBot`, x));
                  await db.set(`${id}`, linkD);
              };
          }).catch(async err => {
            let channel = await client.channels.cache.get("860734440707194910");
            await channel.send(`NEW ERROR ! : `+err, { code: true, split: true});
            if (err) {
                status = false;
                linkD.down = [];
                linkD.all.push(new Request(null, upDate, 503, "Error", true));
                linkD.totalReq.down++;
                await db.set(`${id}`, linkD).then(async x => await db.set(`${id}`, x));
                botDB.add('mainBot.totalReq.down', 1).then(async x => await botDB.set(`mainBot`, x));
            };
          });
          return status
  });
  Promise.all(res).then(async x => {
    await channel.send(`------------\n| UpTime Started At : ${formatTime(upDate)}\n| UpTime Ended At : ${formatTime(new Date())}\n| UpTimed ${x.length} links\n| OK : ${x.filter(x => x == true).length}\n| PAUSED : ${x.filter(x => x == "paused").length}\n| DOWN : ${x.filter(x => !x && x != "paused").length}\n------------`, { code: true, split: true});
  });
};

async function get5ra() {
    return (await db.all()).map(data => {
        if (typeof data.data == 'string') return JSON.parse(data.data);
        return data.data;
    });
};


//فنكشانت ترتيبهم مش مهم
function baseEmbed(message) {
    return new MessageEmbed().setAuthor(client.user.username, client.user.avatarURL()).setFooter(`Requested by `+message.author.username,message.author.avatarURL()).setColor('00ff66');
} 


function urlCheck(url) {
    if (!(url.includes('https') || url.includes('http')) || !(url.includes('glitch') || url.includes('repl') || url.includes('herokuapp'))) return true;
    return false;
}

function normalizeF(num) {
    if (String(num).includes('.')) {
        return String(num).split('.')[0] + '.'+ String(num).split('.')[1].substr(0,2);
    } else {
        return num;
    }
}

function formatTime(date) {
    if (!date) return false;
    var dt = new Date(date);
    return `${
    (dt.getMonth()+1).toString().padStart(2, '0')}/${
    dt.getDate().toString().padStart(2, '0')}/${
    dt.getFullYear().toString().padStart(4, '0')} ${
    dt.getHours().toString().padStart(2, '0')}:${
    dt.getMinutes().toString().padStart(2, '0')}:${
    dt.getSeconds().toString().padStart(2, '0')}`;
}

function clearImgsDir() {
    const imgs = readdirSync(`./imgs/`).filter(d => d.endsWith('.png'));
    for (let img of imgs) {
      try {
        //console.log(img)
        fs.unlinkSync(`./imgs/${img}`);
      } catch (error) {
        null;
      }
    }
    return console.log('Cleared Images !');
}
//-------------------------
return {
    upTime:upTime,
    get5ra:get5ra,
    baseEmbed:baseEmbed,
    urlCheck:urlCheck,
    normalizeF:normalizeF,
    formatTime:formatTime,
    clearImgsDir: clearImgsDir
}
};


