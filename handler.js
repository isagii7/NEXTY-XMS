import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = new Map();

export async function loadCommands() {
    const cmdDir = path.join(__dirname, 'commands');
    const files = fs.readdirSync(cmdDir).filter(f => f.endsWith('.js'));

    for (const file of files) {
        const mod = await import(`./commands/${file}`);
        if (mod.default && Array.isArray(mod.default)) {
            for (const cmd of mod.default) {
                commands.set(cmd.name.toLowerCase(), cmd);
                if (cmd.aliases) {
                    for (const alias of cmd.aliases) {
                        commands.set(alias.toLowerCase(), cmd);
                    }
                }
            }
        }
    }
    console.log(`✅ Loaded ${commands.size} commands`);
}

export function getCommands() {
    return commands;
}

export async function handleCommand(nexty, msg, config) {
    const body = msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption || '';

    if (!body.startsWith(config.PREFIX)) return;

    const args = body.slice(config.PREFIX.length).trim().split(/\s+/);
    const cmdName = args.shift().toLowerCase();
    const text = args.join(' ');

    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isOwner = sender.includes(config.OWNER_NUMBER);
    const isGroup = from.endsWith('@g.us');

    // Private mode check
    if (config.MODE === 'private' && !isOwner && !isGroup) return;

    const cmd = commands.get(cmdName);
    if (!cmd) return;

    // Owner only check
    if (cmd.ownerOnly && !isOwner) {
        await nexty.sendMessage(from, {
            text: `╭─❌ *ACCESS DENIED* ❌\n│\n╰─ This command is *Owner Only!*`
        }, { quoted: msg });
        return;
    }

    const ctx = {
        nexty,
        msg,
        from,
        sender,
        args,
        text,
        isOwner,
        isGroup,
        config,
        reply: async (content) => {
            if (typeof content === 'string') {
                return nexty.sendMessage(from, { text: content }, { quoted: msg });
            }
            return nexty.sendMessage(from, content, { quoted: msg });
        }
    };

    try {
        await cmd.execute(ctx);
    } catch (err) {
        console.error(`Error in command ${cmdName}:`, err);
        await nexty.sendMessage(from, {
            text: `❌ Error: ${err.message}`
        }, { quoted: msg });
    }
}