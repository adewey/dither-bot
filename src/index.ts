require('dotenv').config();
import type { TextChannel } from 'discord.js';
import { discord } from './discord';
import { addRole, removeRole } from './roles';
import { Movies } from './movies';

const init = async () => {
  try {
    console.log(`Logged in as ${discord?.user?.tag}!`);
    const channel = discord.channels.cache.find(
      (channel) => channel.id === process.env.GENERAL_CHANNEL_ID
    ) as TextChannel;
    setInterval(() => channel.guild.members.fetch().catch(console.log), 20000);
    // console.log(channel.guild.roles.cache)
    // discord.channels.cache
    //   .find(channel => channel.name === 'roles')
    //   .send('Test')
  } catch (e) {
    console.warn(e);
  }
};

const movies = new Movies();

discord.on('ready', init);
discord.on('MESSAGE_REACTION_ADD', addRole);
discord.on('MESSAGE_REACTION_ADD', movies.handleEmojiAdd.bind(movies));
discord.on('MESSAGE_REACTION_REMOVE', removeRole);
discord.on('MESSAGE_REACTION_REMOVE', movies.handleEmojiRemove.bind(movies));
discord.on('BOT_COMMAND', movies.onCommand.bind(movies));
