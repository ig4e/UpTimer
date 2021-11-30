const { MessageEmbed, MessageAttachment} = require('discord.js');
const Canvas = require('canvas');
const moment = require('moment');
const { Link, Request, PrimeUser } = require('../../Classes/Classes.js');
const lang = require('../../Configs/lang.json');
const config = require('../../Configs/config.json');
const timers = config.timers;
const pings = config.config;
const flip = (a, b) => b.time - a.time;
const cmdCD = require('command-cooldown');
const fs = require('fs');

module.exports = {
    info: {
        name: 'status',
        alis : ['me'],
        description: 'Displays your links to manage them or check its status',
    },
	async run(client, message, cmd, lang, prefix, primeU , mongo) {
        const db = await mongo.createModel('data');
        let resSpeedCh = client.channels.cache.get('873425440893726720');
        let waitm = await message.channel.send(baseEmbed(message).setTitle(`${lang.loading}`).setColor("GREEN"));
        let date = new Date();
        let data = await get5ra();
        if (!data) return waitm.edit(baseEmbed(message).setTitle(`<:false:859700876183994400> Error | something went wrong please try again`).setColor('RED'));
        let ownedProjects = (data).filter(x => x.owner == message.author.id);
        resSpeedCh.send(message.author.tag + ' | Owend Projects : '+ (new Date() - date) + "Ms");
        cmdCD.addCoolDown(message.author.id, primeU ? (timers.cds.high /2)-1500 : timers.cds.high);

        let msg = await waitm.edit({
          embed:  baseEmbed(message).setDescription(ownedProjects.length > 0 ? ownedProjects.map(x => `**${ownedProjects.findIndex(u => u.url == x.url)} - \\${x.paused ? '🔴' : '🟢'} | ${'https://'+getID(x.url)}**`).join('\n') : lang.noLinks)
          .setColor(ownedProjects.length > 0 ? "GREEN" : "YELLOW").setTitle(`To Select click \🟢 and then type the wanted link number`)
        });

        resSpeedCh.send(message.author.tag + ' | Whole code : ' + (new Date() - date) + "Ms");
        
        msg.sekaiCollectors = [];
        if (ownedProjects.length > 0) statusL(message,msg,ownedProjects);

        async function get5ra() {
            return (await db.all()).map(data => {
                if (typeof data.data == 'string') return JSON.parse(data.data);
                return data.data;
            });
        };

        async function statusL(message,msg,ownedProjects) {
                if (ownedProjects.length <= 0) ownedProjects = (await get5ra()).filter(x => x.owner == message.author.id);
                await msg.react('🟢');
                let collector = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '🟢' && user.id === message.author.id, { time: timers.rcet.high, max : 1 });
                collector.on('collect', async (reaction, user) => {
                (await msg.reactions.removeAll().catch(x => null));
                    msg.edit({embed: baseEmbed(message).setDescription(ownedProjects.map(x => `**${ownedProjects.findIndex(u => u.url == x.url)} - \\${x.paused ? '🔴' : '🟢'} | ${'https://'+getID(x.url)}**`).join('\n')).setTitle(lang.selectLink)});
                    let collector = message.channel.createMessageCollector((res, user) => !isNaN(res.content) && res.author.id == message.author.id && Number(res.content) <= (ownedProjects.length-1), { time: timers.rcet.high, max : 1 });
                    msg.sekaiCollectors.push(collector);
                    collector.on('collect', async (m, user) => {
                        msg.edit({embed: baseEmbed(message).setTitle(lang.loading) }); //Loading...
                        let linkD = ownedProjects[Number(m.content.trim())];
                        if (!(Object.values(linkD).length > 0)) return message.channel.send(baseEmbed(message).setTitle('<:false:859700876183994400> Failed | '+lang.errorSelect).setColor('#ff0000'));
                        let id = linkD.url.replace('https://',"").replace('http://',"").replace('/',"").split('.')[0];
                        await msg.edit({ embed : await urlInfo(linkD,message)});
                        (await msg.reactions.removeAll().catch(x => null));
                        await msg.sekaiCollectors.forEach(col => {try { col.stop("newp"); } catch { null; };});
                        await statusL(message,msg,ownedProjects);
                        await pauseResume(linkD, msg, message);
                        if ((getLast(2,linkD)).length <= 1) return msg.edit({
                                embed:baseEmbed(message).setDescription(`**<:status:859694630240518174> | No Status Yet : \`Wait 2.4m\`**`).setColor('YELLOW')
                        });
                        await lastReqPage(linkD, msg, message);
                    });
                });
                msg.sekaiCollectors.push(collector);
        };
        async function pauseResume(linkD, msg, message) {
        let id = linkD.url.replace('https://',"").replace('http://',"").replace('/',"").split('.')[0];
        linkD.paused ? await msg.react('▶️') : await msg.react('⏸️');
        let collector = msg.createReactionCollector((reaction, user) => (reaction.emoji.name === '▶️' || reaction.emoji.name === '⏸️') && user.id === message.author.id, { time: timers.rcet.high, max : 1 });
        collector.on('collect', async (reaction, user) => {
            let done = await db.set(`${id}.paused`, !(await db.get(id)).paused);
            message.channel.send(
            baseEmbed(message).setTitle(`${done ? '<:true:859700876604211229> Done' : "<:false:859700876183994400> Failed"} | ${linkD.paused ? 'Resumed' : 'Paused'} uptiming ${lang.edit}`)
            ).then(x => x.delete({ timeout : 2500}));
            (await msg.reactions.removeAll().catch(x => null));
            setTimeout( async () => {
                ownedProjects = (await get5ra()).filter(x => x.owner == message.author.id);
                linkD = ownedProjects[ownedProjects.findIndex(x => x.url == linkD.url)];
                await msg.sekaiCollectors.forEach(col => {try { col.stop("newp"); } catch { null; };});
                await msg.edit({embed : baseEmbed(message).setTitle(lang.loading)}); //Loading...
                await msg.edit({embed : await urlInfo(linkD,message)});
                await statusL(message,msg,ownedProjects);
                await pauseResume(linkD, msg, message);
                await lastReqPage(linkD, msg, message);
                }, 875);
            });
            collector.on('end', async (coll,reason) => {
                if (reason == 'newp') return;
                if (coll.size < 1) (await msg.reactions.removeAll().catch(x => null));
            });
            msg.sekaiCollectors.push(collector);
        }
        async function lastReqPage(linkD, msg, message) {
                    let id = linkD.url.replace('https://',"").replace('http://',"").replace('/',"").split('.')[0];
                        await msg.react('➡️');
                        let collector2 = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, { time: timers.rcet.high, max : 1 });
                        collector2.on('collect', async (reaction, user) => {
                            (await msg.reactions.removeAll().catch(x => null));
                            await msg.edit({embed: baseEmbed(message).setTitle(lang.loading)}); //Loading...
                            let last30 = getLast(30,linkD);
                            let url = await makeChartPng(last30,id+'-30');
                            msg.edit({embed : baseEmbed(message).setDescription(`**| ----------------------------Last 30 Requests---------------------------- |\n\`\`\`js\n${last30.map(x => `${formatTime(x.time) ? formatTime(x.time) : 'Not Recorded'} | Ping : ${x.ping ? x.ping +'ms' : '-'} | ${x.statusText+` (${x.status})`}`).join('\n')}\`\`\`**`)
                            .setTitle(`\\${last30[0].status == 200 ? "🟢 | UP" : "🔴 | DOWN" }`)
                            .setImage(url)
                            .setColor((linkD.paused ? 'RED' : 'GREEN'))});
                            (await msg.reactions.removeAll().catch(x => null));
                            await msg.react('⬅️');
                            let collector3 = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, { time: timers.rcet.high, max : 1 });
                            await msg.sekaiCollectors.push(collector3);
                            collector3.on('collect', async (reaction, user) => {
                            (await msg.reactions.removeAll().catch(x => null));
                            await msg.sekaiCollectors.forEach(col => {try { col.stop("newp"); } catch { null; };});
                            await msg.edit({embed : baseEmbed(message).setTitle(lang.loading)}); //Loading...
                            await msg.edit({embed : await urlInfo(linkD,message)});
                            await statusL(message,msg,ownedProjects);
                            await pauseResume(linkD, msg, message);
                            if (last30.length <= 1) return await msg.edit({embed: baseEmbed(message).setDescription(`**<:status:859694630240518174> | No Status Yet : \`Wait 2.4m\`**`).setColor('YELLOW')});
                            await lastReqPage(linkD, msg, message);
                            });
                        collector3.on('end', async (coll,reason) => {
                            if (reason == 'newp') return;
                            if (coll.size < 1) (await msg.reactions.removeAll().catch(x => null));
                        });
                        });
                        await msg.sekaiCollectors.push(collector2);
        }
        async function urlInfo(linkD, message) {
            let id = linkD.url.replace('https://',"").replace('http://',"").replace('/',"").split('.')[0];
            let last5 = getLast(5,linkD);
            if (last5.length <= 1) return baseEmbed(message).setDescription(`**<:status:859694630240518174> | No Status Yet : \`Wait 2.4m\`**`).setColor('YELLOW');
            let url = await makeChartPng(last5,id);
            let average = (array) => array.reduce((all, one, _, src) => all += one / src.length, 0);
            let down = await getDownTime(linkD.down);
                return baseEmbed(message).setDescription(`**
        | Link ID : \`${getID(linkD.url)}\`
        | Created at : \`${formatTime(linkD.createdAt)} | ${moment(new Date(linkD.createdAt)).fromNow()}\`
        | AVG Response Time : \`${ average(linkD.all.filter(x => x.ping).map(x => x.ping)).toFixed(1) }ms\`
        | Total Uptime : \`${((linkD.totalReq.up * timers.main.interval) / 60).toFixed(1)} hours\` (\`${String(normalizeF(100 - (linkD.totalReq.down / linkD.totalReq.up))).replace('-Infinity', '0')}%\`)
        | Total Downtime : \`${((linkD.totalReq.down * timers.main.interval) / 60).toFixed(2)} hours\`
        | Lastest Downtime : \`${down[0] ? formatTime(down[0].time) : "No Downtimes Recorded"} | Lasted for : ${down[0] ? `${(await down.length * timers.main.timer).toFixed(1)}m` : '-'} \`
        | Paused : ${(linkD.paused ? '<:true:859700876604211229>' : '<:false:859700876183994400>')}
        | Total Requests (UP / DOWN) : \`${linkD.totalReq.up} / ${linkD.totalReq.down} (${linkD.totalReq.down + linkD.totalReq.up})\`\n
        | -----------------------------Last 5 Requests----------------------------- |
        \`\`\`js\n${last5.map(x => `${formatTime(x.time) ? formatTime(x.time) : 'Not Recorded'} | Ping : ${x.ping ? x.ping +'ms' : '-'} | ${x.statusText+` (${x.status})`}`).join('\n')}\`\`\`**`)
                .setTitle(`\\${last5[0].status == 200 ? "🟢 | UP" : "🔴 | DOWN" }`)
                .setImage(url)
                .setColor((linkD.paused ? 'RED' : 'GREEN'));
        };

        async function makeChartPng(last5,id) {
            await MakeChart({labels: last5.map(x => formatTime(x.time)? formatTime(x.time).substr(11) : "UNKNOWN"),data : last5.map(x => x.ping ? x.ping : 0)},id,id);
            const replaceColor = require('replace-color');
            return new Promise(async x => {
            await replaceColor({image: `./imgs/${id}.png`,colors: {type: 'hex', targetColor: '#666666', replaceColor: '#00ff4c'}})
            .then(async (jimpObject) => {
            await jimpObject.write(`./imgs/${id}.png`, async (err) => {
                if (err) return console.log('Slow Chart Render ~!');
                const canvas = Canvas.createCanvas(860, 420);
            const ctx = canvas.getContext('2d');
            const background = await Canvas.loadImage('./imgs/wallpaper.jpg');
            const chart = await Canvas.loadImage(`./imgs/${id}.png`);
            await ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            await ctx.drawImage(chart, 0, 0, canvas.width, canvas.height);
            const attachment = new MessageAttachment(canvas.toBuffer(), id+'.png');
            let channel = await client.channels.cache.get("855160600275845150");
            try {
              fs.unlinkSync(`./imgs/${id}.png`);
              fs.unlinkSync(`./imgs/${id}-30.png`);
            } catch (error) {
              null;
            }
            return x(await (await channel.send(attachment)).attachments.first().url);
            });
            })
            .catch((err) => {
            console.log('Slow Chart Render ~!');
            })
            });
        }

        async function MakeChart(x,label,id) {
            const QuickChart = require('quickchart-js');
            const myChart = new QuickChart();
            const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
            const data = {
                labels: x.labels,
                datasets: [{
                    color: '#ff0000',
                    label: 'Milliseconds | Last 24 Hours',
                    backgroundColor: "rgba(0, 255, 76, 0.13)",
                    borderColor: 'rgb(0, 255, 76)',
                    borderWidth: "3",
                    fill: "origin",
                    data: x.data, segment: {
                    borderDash: ctx => skipped(ctx, [6, 6]),
                    },  
                }],
                };
                const configuration = {
                    type: 'line',
                    data,
                    options: {
                        radius: 0,
                        scales: {
                            x: {
                                grid: {color: '#333333',},
                                ticks:{color:'rgb(255, 112, 3)',padding:20}
                            }, 
                            y: {
                                grid: {
                                    color: '#333333',
                                },
                                ticks:{
                                    color:'rgb(255, 112, 3)',
                                    padding:20
                                }
                            }
                        }, plugins: {legend: {labels: {font: { size: 0}}}}
                    }
                };   
                await myChart.setConfig(configuration).setWidth(490).setHeight(290).setBackgroundColor('rgba(1,1,1,0');
            return await myChart.toFile(`./imgs/${id}.png`);
        };




        //فنكشانت ترتيبهم مش مهم
        function baseEmbed(message) {
            return new MessageEmbed().setAuthor(client.user.username, client.user.avatarURL()).setFooter(`Requested by `+message.author.username,message.author.avatarURL()).setColor('00ff66');
        } 

        function urlCheck(url) {
            if (!(url.includes('https') || url.includes('http')) || !(url.includes('glitch') || url.includes('repl'))) return true;
            return false;
        }

        function normalizeF (num) {
            if (String(num).includes('.')) {
                return String(num).split('.')[0] + '.'+ String(num).split('.')[1].substr(0,2);
            } else {
                return num;
            }
        }

        function getLast(num, linkD) {
            let newArr = linkD.all;
            return newArr.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0,num);
        }

       async function getDownTime(array) {
          let res = [];
          let arrF = (await array.filter(x => x.bad == true)).sort( (a, b) => a.time - b.time);
          for(let i = 1; i < arrF.length; i++) {
              console.log((new Date(arrF[i].time) - new Date(arrF[i-1].time)) <= (timers.main.ms + 12500))
              if ((new Date(arrF[i].time) - new Date(arrF[i-1].time)) <= (timers.main.ms + 12500)) {
                  res.push(arrF[i]);
              } else break;
          }
          return res;
        };

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
        function getID(url) {
          return url.replace('https://',"").replace('http://',"").replace('/',"").split('.')[0];
        }
        //-------------------------
    }
}