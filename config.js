const config = {
    SESSION: process.env.SESSION || '',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '923192084504',
    OWNER_NAME: process.env.OWNER_NAME || 'Nexty Owner',
    PREFIX: process.env.PREFIX || '.',
    MODE: process.env.MODE || 'public',
    AUTO_READ: process.env.AUTO_READ === 'true' || false,
    BOT_NAME: 'Nexty Bot',
    VERSION: '1.0.0',
    SELF: false,
    MENU_VIDEO: 'https://files.catbox.moe/l71qqt.mp4',
    REPO: 'https://github.com/isagii7/nexty-bot',
};

export default config;