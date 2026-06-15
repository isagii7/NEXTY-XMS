import Jimp from 'jimp';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default [
    {
        name: 'sticker',
        aliases: ['s', 'stiker'],
        description: 'Convert image/video to sticker',
        execute: async ({ nexty, from, msg, reply, config }) => {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImage = msg.message?.imageMessage || quoted?.imageMessage;
            const isVideo = msg.message?.videoMessage || quoted?.videoMessage;

            if (!isImage && !isVideo) {
                return reply('❌ Please send an image or video with *.sticker* caption!\n\nOr reply to an image/video with *.sticker*');
            }

            await reply('🎨 *Creating sticker...*');

            try {
                const msgToProcess = isImage
                    ? (msg.message?.imageMessage ? msg : { message: quoted, key: msg.key })
                    : (msg.message?.videoMessage ? msg : { message: quoted, key: msg.key });

                const mediaType = isImage ? 'imageMessage' : 'videoMessage';
                const stream = await nexty.downloadMediaMessage(msgToProcess);

                const sticker = new Sticker(stream, {
                    pack: config.BOT_NAME,
                    author: config.OWNER_NAME,
                    type: isVideo ? StickerTypes.VIDEO : StickerTypes.DEFAULT,
                    quality: 50,
                });

                const stickerBuffer = await sticker.toBuffer();

                await nexty.sendMessage(from, {
                    sticker: stickerBuffer
                }, { quoted: msg });

            } catch (err) {
                console.error('Sticker error:', err);
                await reply('❌ Failed to create sticker! Make sure image/video is valid.');
            }
        }
    },
    {
        name: 'toimg',
        aliases: ['toimage', 'stickertoimg'],
        description: 'Convert sticker to image',
        execute: async ({ nexty, from, msg, reply }) => {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isSticker = msg.message?.stickerMessage || quoted?.stickerMessage;

            if (!isSticker) return reply('❌ Reply to a sticker with *.toimg*');

            await reply('🔄 *Converting sticker to image...*');

            try {
                const msgToProcess = msg.message?.stickerMessage
                    ? msg
                    : { message: quoted, key: msg.key };

                const stream = await nexty.downloadMediaMessage(msgToProcess);

                await nexty.sendMessage(from, {
                    image: stream,
                    caption: '✅ *Converted!*\n\n> ⚡ *Nexty Bot*'
                }, { quoted: msg });

            } catch (err) {
                await reply('❌ Failed to convert sticker!');
            }
        }
    }
];