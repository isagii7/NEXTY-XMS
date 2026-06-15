export default [
    {
        name: 'kick',
        aliases: ['remove'],
        description: 'Kick member from group',
        execute: async ({ nexty, from, msg, isGroup, isOwner, reply }) => {
            if (!isGroup) return reply('❌ This command is for groups only!');

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
            const target = mentioned[0] || quoted;

            if (!target) return reply('❌ Please mention or reply to a user!\n\nExample: *.kick @user*');

            try {
                await nexty.groupParticipantsUpdate(from, [target], 'remove');
                await reply(`✅ *Kicked successfully!*\n\n👤 User: @${target.split('@')[0]}`, { mentions: [target] });
            } catch {
                await reply('❌ Failed! Make sure I am admin.');
            }
        }
    },
    {
        name: 'add',
        description: 'Add member to group',
        execute: async ({ nexty, from, msg, isGroup, text, reply }) => {
            if (!isGroup) return reply('❌ This command is for groups only!');
            if (!text) return reply('❌ Provide number!\n\nExample: *.add 923001234567*');

            const number = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

            try {
                await nexty.groupParticipantsUpdate(from, [number], 'add');
                await reply(`✅ *Added successfully!*\n\n👤 Number: ${text}`);
            } catch {
                await reply('❌ Failed! Check number or bot admin status.');
            }
        }
    },
    {
        name: 'promote',
        description: 'Promote member to admin',
        execute: async ({ nexty, from, msg, isGroup, reply }) => {
            if (!isGroup) return reply('❌ This command is for groups only!');

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
            const target = mentioned[0] || quoted;

            if (!target) return reply('❌ Please mention or reply to a user!');

            try {
                await nexty.groupParticipantsUpdate(from, [target], 'promote');
                await reply(`✅ *Promoted to admin!*\n\n👤 User: @${target.split('@')[0]}`, { mentions: [target] });
            } catch {
                await reply('❌ Failed! Make sure I am admin.');
            }
        }
    },
    {
        name: 'demote',
        description: 'Demote admin to member',
        execute: async ({ nexty, from, msg, isGroup, reply }) => {
            if (!isGroup) return reply('❌ This command is for groups only!');

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
            const target = mentioned[0] || quoted;

            if (!target) return reply('❌ Please mention or reply to a user!');

            try {
                await nexty.groupParticipantsUpdate(from, [target], 'demote');
                await reply(`✅ *Demoted to member!*\n\n👤 User: @${target.split('@')[0]}`, { mentions: [target] });
            } catch {
                await reply('❌ Failed! Make sure I am admin.');
            }
        }
    },
    {
        name: 'open',
        description: 'Open group chat',
        execute: async ({ nexty, from, isGroup, reply }) => {
            if (!isGroup) return reply('❌ Groups only!');
            try {
                await nexty.groupSettingUpdate(from, 'not_announcement');
                await reply('✅ *Group is now OPEN!*\n\nAll members can send messages.');
            } catch {
                await reply('❌ Failed! Make sure I am admin.');
            }
        }
    },
    {
        name: 'close',
        description: 'Close group chat',
        execute: async ({ nexty, from, isGroup, reply }) => {
            if (!isGroup) return reply('❌ Groups only!');
            try {
                await nexty.groupSettingUpdate(from, 'announcement');
                await reply('✅ *Group is now CLOSED!*\n\nOnly admins can send messages.');
            } catch {
                await reply('❌ Failed! Make sure I am admin.');
            }
        }
    },
    {
        name: 'tagall',
        aliases: ['tgall', 'everyone'],
        description: 'Tag all group members',
        execute: async ({ nexty, from, msg, isGroup, text, reply }) => {
            if (!isGroup) return reply('❌ Groups only!');

            try {
                const group = await nexty.groupMetadata(from);
                const members = group.participants.map(p => p.id);
                const message = text || '📢 *Attention everyone!*';

                let mentions = members.map(m => `@${m.split('@')[0]}`).join(' ');

                await nexty.sendMessage(from, {
                    text: `${message}\n\n${mentions}`,
                    mentions: members
                }, { quoted: msg });
            } catch {
                await reply('❌ Failed to tag members!');
            }
        }
    }
];