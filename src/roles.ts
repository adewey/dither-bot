import type { GuildMember, MessageReaction, TextChannel } from 'discord.js';

const emojiToRoleId = (name: string) => {
  switch (name) {
    case 'Nertsplz':
      return process.env.NERTS_ROLE_ID;
    case '🥏':
      return process.env.DISC_GOLF_ROLE_ID;
    case '🧠':
      return process.env.IQ_FARMER_ROLE_ID;
    case '🎃':
      return process.env.HALLOWEENIES_ROLE_ID;
    case '🍴':
      return process.env.FORKKNIFE_ROLE_ID;
    case '🍽️':
      return process.env.FORKKNIFE_ROLE_ID;
    case 'Aaron':
      return process.env.FRIENDS_ROLE_ID;
  }
};

export const addRole = (
  reaction: MessageReaction,
  channel: TextChannel,
  user: GuildMember
) => {
  if (channel.id === process.env.ROLE_CHANNEL_ID) {
    const roleId = emojiToRoleId(reaction.emoji.name as string);
    if (roleId) {
      const role = channel.guild.roles.cache.get(roleId);
      if (role && !user.roles.cache.get(role.id)) {
        const roleInfo = `role ${role.name} to ${
          user.nickname || user.user.username
        }`;
        console.log(`adding ${roleInfo}`);
        user.roles
          .add(role)
          .then(() => console.log(`added ${roleInfo}`))
          .catch(console.warn);
      }
    }
  }
};

export const removeRole = (
  reaction: MessageReaction,
  channel: TextChannel,
  user: GuildMember
) => {
  if (channel.id === process.env.ROLE_CHANNEL_ID) {
    const roleId = emojiToRoleId(reaction.emoji.name as string);
    if (roleId) {
      const role = channel.guild.roles.cache.get(roleId);
      if (role && user.roles.cache.get(role.id)) {
        const roleInfo = `role ${role.name} from ${
          user.nickname || user.user.username
        }`;
        console.log(`removing ${roleInfo}`);
        user.roles
          .remove(role)
          .then(() => console.log(`removed ${roleInfo}`))
          .catch(console.warn);
      }
    }
  }
};
