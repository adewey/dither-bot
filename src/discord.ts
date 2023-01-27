import { Client, Intents } from 'discord.js';
import type { TextChannel } from 'discord.js';

export const discord = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
  ],
});

discord.login(process.env.DISCORD_OAUTH);

discord.on('rateLimit', (rateLimitInfo) => {
  console.log(rateLimitInfo);
});

// discord.on('messageCreate', (msg) => {
//   const {
//     author: { username },
//     content,
//   } = msg;
//   if (msg.channel.type === 'DM') {
//     if (msg.attachments.size) {
//       // msg.attachments[0].attachment
//       // download and decode attachment
//     }
//   }
//   if (msg.content === 'ping') {
//     msg.reply('Pong!');
//   }
//   // console.log(`${username}: ${content}`);
// });

discord.ws.on('MESSAGE_REACTION_ADD', (reaction) => {
  const channel = discord.channels.cache.get(
    reaction.channel_id
  ) as TextChannel;
  const user = channel.guild.members.cache.get(reaction.user_id);
  if (!user || user.user.bot) return;
  discord.emit('MESSAGE_REACTION_ADD', reaction, channel, user);
});

discord.ws.on('MESSAGE_REACTION_REMOVE', (reaction) => {
  const channel = discord.channels.cache.find(
    ({ id }) => id === reaction.channel_id
  ) as TextChannel;
  const user = channel.guild.members.cache.find(
    ({ id }) => id === reaction.user_id
  );
  if (!user || user.user.bot) return;
  discord.emit('MESSAGE_REACTION_REMOVE', reaction, channel, user);
});

const prefix = '!';
discord.on('messageCreate', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();
  discord.emit('BOT_COMMAND', message, command, args);
});

// const interactionResponse = ({ id, token }, content) =>
//   (discord as any).api.interactions(id, token).callback.post({
//     data: {
//       type: 4,
//       data: {
//         flags: 64,
//         content,
//       },
//     },
//   });

// const handleInteraction = async (interaction) => {
//   const { id } = interaction.member.user;
//   const username = interaction.member.nick || interaction.member.user.username;
//   const [{ name, options }] = interaction.data.options;
//   switch (name) {
//     default: {
//       console.log('unhandled command:', { id, username, name, options });
//       break;
//     }
//   }
// };

discord.ws.on('INTERACTION_CREATE', async (interaction) => {
  switch (interaction.data.name) {
    default: {
      console.log(
        'unhandled command:',
        interaction.data.name,
        interaction.data.options
      );
    }
  }
});
