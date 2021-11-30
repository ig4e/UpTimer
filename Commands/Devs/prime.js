const lang = require('../../Configs/lang.json');
const config = require('../../Configs/config.json');
const { Link, Request, PrimeUser } = require('../../Classes/Classes.js');
const timers = config.timers;
const pings = config.config;
const { MessageButton , MessageActionRow } = require("discord-buttons");
const cmdCD = require('command-cooldown');

module.exports = {
    info: {
        name: 'prime',
        alis : ['pr'],
        description: '',
    },
	async run(client, message, cmd, lang, prefix, primeU , mongo) {
        const db = await mongo.createModel('data');
        const prime = await mongo.createModel('prime');
        const { upTime, get5ra, baseEmbed, urlCheck, normalizeF, formatTime } = require('../../Functions/functions.js')(client, mongo);
        if (!["451474312306622489","436231895651450890"].includes(message.author.id)) return;
        let user = message.mentions.users.first();
        if (!user) return;
        prime.set(`u_${user.id}`, new PrimeUser(user.id, new Date()));
        user.send(
          baseEmbed(message).setTitle('<:true:859700876604211229> Done | You are now a Prime Subscriber !')
          .setDescription(`**\| We want to thank so much you for your support <3 tysm !\n\| here is some custom perks for your prime subscription.\n\n\|\`1 -\` 3x More links space you can now uptime up to 15 link 🎉 !\n\|\`2 -\` 2x short cooldown your cooldowns is now half the time as before 🎉 !\n\n\| Big Thnaks : Sekai - Death**`).setFooter(`Dev - `+message.author.username,message.author.avatarURL())
        );
        await message.channel.send(baseEmbed(message).setDescription(`**<:true:859700876604211229> Done | ${user.username} Is now a prime subscriber 🎉 !**`).setFooter(`Dev - `+message.author.username,message.author.avatarURL()));
    }
}