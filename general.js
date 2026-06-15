import os from 'os';

export default [
    {
        name: 'ping',
        aliases: ['speed'],
        description: 'Check bot response speed',
        execute: async ({ reply, msg }) => {
            const start = Date.now();
            const sent = await reply('🏓 *Pinging...*');
            const speed = Date.now() - start;
            await reply(`╭─「 🏓 *PING* 」
│
│ ⚡ *Speed:* ${speed}ms
│ 🟢 *Status:* Online
│ 💾 *RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB
│
╰─ *Nexty Bot* ⚡`);
        }
    },
    {
        name: 'runtime',
        aliases: ['uptime'],
        description: 'Show bot uptime',
        execute: async ({ reply }) => {
            const sec = Math.floor(process.uptime());
            const d = Math.floor(sec / 86400);
            const h = Math.floor((sec % 86400) / 3600);
            const m = Math.floor((sec % 3600) / 60);
            const s = sec % 60;
            await reply(`╭─「 ⏱️ *RUNTIME* 」
│
│ 📅 *Days:* ${d}
│ 🕐 *Hours:* ${h}
│ 🕑 *Minutes:* ${m}
│ 🕒 *Seconds:* ${s}
│
╰─ *Nexty Bot* ⚡`);
        }
    },
    {
        name: 'info',
        aliases: ['botinfo'],
        description: 'Bot information',
        execute: async ({ reply, config }) => {
            const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const total = (os.totalmem() / 1024 / 1024).toFixed(0);
            await reply(`╭─「 🤖 *NEXTY BOT INFO* 」
│
│ 🏷️ *Name:* ${config.BOT_NAME}
│ 🔖 *Version:* ${config.VERSION}
│ 👑 *Owner:* ${config.OWNER_NAME}
│ 🌐 *Mode:* ${config.MODE}
│ 🔧 *Prefix:* ${config.PREFIX}
│ 💾 *RAM:* ${ram}MB / ${total}MB
│ 🖥️ *Platform:* ${os.platform()}
│ 📦 *Node:* ${process.version}
│
╰─ *Nexty Bot* ⚡`);
        }
    }
];