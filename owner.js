export default [
    {
        name: 'broadcast',
        aliases: ['bc'],
        description: 'Broadcast message to all chats',
        ownerOnly: true,
        execute: async ({ nexty, text, reply }) => {
            if (!text) return reply('❌ Provide message!\n\nExample: *.broadcast Hello everyone!*');

            const chats = await nexty.groupFetchAllParticipating();
            const groups = Object.keys(chats);

            await reply(`📢 *Broadcasting to ${groups.length} groups...*`);

            let success = 0;
            for (const group of groups) {
                try {
                    await nexty.sendMessage(group, {
                        text: `📢 *BROADCAST*\n\n${text}\n\n> ⚡ *Nexty Bot*`
                    });
                    success++;
                    await new Promise(r => setTimeout(r, 1000));
                } catch {}
            }

            await reply(`✅ *Broadcast complete!*\n\n📊 Sent to: ${success}/${groups.length} groups`);
        }
    },
    {
        name: 'block',
        description: 'Block a user',
        ownerOnly: true,
        execute: async ({ nexty, msg, reply }) => {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
            const target = mentioned[0] || quoted;

            if (!target) return reply('❌ Mention or reply to a user!');

            try {
                await nexty.updateBlockStatus(target, 'block');
                await reply(`✅ *Blocked!*\n\n👤 User: @${target.split('@')[0]}`, { mentions: [target] });
            } catch {
                await reply('❌ Failed to block!');
            }
        }
    },
    {
        name: 'unblock',
        description: 'Unblock a user',
        ownerOnly: true,
        execute: async ({ nexty, msg, reply }) => {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const target = mentioned[0];

            if (!target) return reply('❌ Mention a user!');

            try {
                await nexty.updateBlockStatus(target, 'unblock');
                await reply(`✅ *Unblocked!*\n\n👤 User: @${target.split('@')[0]}`, { mentions: [target] });
            } catch {
                await reply('❌ Failed to unblock!');
            }
        }
    }
];