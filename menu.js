import os from 'os';

function getUptime() {
    const sec = Math.floor(process.uptime());
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
}

function getRam() {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const total = os.totalmem() / 1024 / 1024;
    return `${used.toFixed(0)}MB / ${total.toFixed(0)}MB`;
}

const menuText = (config) => `
╔══════════════════════╗
║  ⚡ *NEXTY BOT MENU* ⚡  ║
╚══════════════════════╝

┌─────────────────────
│ 🤖 *Bot:* ${config.BOT_NAME}
│ 👑 *Owner:* ${config.OWNER_NAME}
│ 🔖 *Prefix:* ${config.PREFIX}
│ ⏱️ *Uptime:* ${getUptime()}
│ 💾 *RAM:* ${getRam()}
│ 🌐 *Mode:* ${config.MODE}
└─────────────────────

╭─「 🎯 *GENERAL* 」
│ ➤ ${config.PREFIX}menu - Show this menu
│ ➤ ${config.PREFIX}ping - Check bot speed
│ ➤ ${config.PREFIX}info - Bot information
│ ➤ ${config.PREFIX}runtime - Bot uptime
╰─────────────────────

╭─「 📥 *DOWNLOAD* 」
│ ➤ ${config.PREFIX}song <name> - Download MP3
│ ➤ ${config.PREFIX}video <name> - Download MP4
│ ➤ ${config.PREFIX}tiktok <url> - TikTok video
│ ➤ ${config.PREFIX}apk <name> - Download APK
╰─────────────────────

╭─「 🤖 *AI TOOLS* 」
│ ➤ ${config.PREFIX}ai <text> - AI Chat
│ ➤ ${config.PREFIX}gpt <text> - GPT Chat
╰─────────────────────

╭─「 🎨 *MEDIA* 」
│ ➤ ${config.PREFIX}sticker - Image to Sticker
│ ➤ ${config.PREFIX}toimg - Sticker to Image
╰─────────────────────

╭─「 👥 *GROUP* 」
│ ➤ ${config.PREFIX}kick @user - Kick member
│ ➤ ${config.PREFIX}add number - Add member
│ ➤ ${config.PREFIX}promote @user - Make admin
│ ➤ ${config.PREFIX}demote @user - Remove admin
│ ➤ ${config.PREFIX}open - Open group
│ ➤ ${config.PREFIX}close - Close group
│ ➤ ${config.PREFIX}tagall - Tag all members
╰─────────────────────

╭─「 👑 *OWNER ONLY* 」
│ ➤ ${config.PREFIX}broadcast - Broadcast msg
│ ➤ ${config.PREFIX}block - Block user
│ ➤ ${config.PREFIX}unblock - Unblock user
╰─────────────────────

> ⚡ *Nexty Bot v${config.VERSION}* | © 2025
`.trim();

export default [
    {
        name: 'menu',
        aliases: ['help', 'start'],
        description: 'Show bot menu',
        execute: async ({ nexty, from, msg, config }) => {
            await nexty.sendMessage(from, {
                video: { url: config.MENU_VIDEO },
                caption: menuText(config),
                gifPlayback: false,
            }, { quoted: msg });
        }
    }
];