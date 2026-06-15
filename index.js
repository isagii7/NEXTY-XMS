import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    downloadContentFromMessage,
    jidNormalizedUser
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import config from './config.js';
import { loadCommands, handleCommand } from './handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Decode SESSION from env
function decodeSession(sessionId) {
    try {
        if (sessionId.startsWith('NEXTY~')) {
            const b64 = sessionId.slice(6);
            const decoded = Buffer.from(b64, 'base64').toString('utf8');
            return JSON.parse(decoded);
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function startNexty() {
    const sessionDir = './nexty_session';
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    // Write creds from SESSION env if session not exists
    const credsPath = path.join(sessionDir, 'creds.json');
    if (!fs.existsSync(credsPath)) {
        const SESSION = process.env.SESSION || config.SESSION;
        if (!SESSION) {
            console.log('❌ No SESSION found! Set SESSION in config.js or env vars');
            process.exit(1);
        }
        const creds = decodeSession(SESSION);
        if (!creds) {
            console.log('❌ Invalid SESSION format!');
            process.exit(1);
        }
        fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2));
        console.log('✅ Session loaded from NEXTY~ ID');
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const nexty = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Nexty Bot', 'Chrome', '1.0.0'],
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
    });

    // Load all commands
    await loadCommands();

    nexty.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log(`
╔══════════════════════════╗
║   ⚡  NEXTY BOT ONLINE   ║
╚══════════════════════════╝
✅ Connected Successfully!
👑 Owner: ${config.OWNER_NAME}
🌐 Prefix: ${config.PREFIX}
📱 Mode: ${config.MODE}
            `);
        }

        if (connection === 'close') {
            const shouldReconnect = new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('🔁 Reconnecting...');
                startNexty();
            } else {
                console.log('❌ Logged out. Please generate new session.');
            }
        }
    });

    nexty.ev.on('creds.update', saveCreds);

    nexty.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (!msg.message) continue;
            if (msg.key.fromMe && !config.SELF) continue;

            try {
                await handleCommand(nexty, msg, config);
            } catch (err) {
                console.error('Message handling error:', err);
            }
        }
    });

    // Auto read messages
    nexty.ev.on('messages.upsert', async ({ messages }) => {
        if (config.AUTO_READ) {
            for (const msg of messages) {
                await nexty.readMessages([msg.key]).catch(() => {});
            }
        }
    });

    return nexty;
}

startNexty().catch(console.error);

process.on('uncaughtException', (err) => {
    const e = String(err);
    if (e.includes('conflict')) return;
    if (e.includes('not-authorized')) return;
    if (e.includes('Connection Closed')) return;
    if (e.includes('Timed Out')) return;
    if (e.includes('Stream Errored')) return;
    console.error('Uncaught Exception:', err);
});