import crypto from 'crypto';
import {
  GuildMember,
  Message,
  MessageEmbed,
  MessageReaction,
  TextChannel,
} from 'discord.js';

import { FileStorage } from './filestorage';
import { movieSort, titleCase } from './utils';
import type { Movie, MovieState } from './types';

const MOVIE_TICKETS = ['🎟️'];
type Command =
  | 'list'
  | 'add'
  | 'remove'
  | 'random'
  | 'attendees'
  | 'weenies'
  | 'vote'
  | 'commands';

const acceptableAuthors = ['sk8trmuffin', 'dither'];

const validChannelIds = [
  process.env.MOVIE_CHANNEL_ID,
  process.env.TEST_CHANNEL_ID,
];

const commands = `
halloweenies channel commands
list: list movies
add: add a movie to the list
remove: remove a movie from the list
random: select random movies
attendees: list attendees
commands: this freakin thing`;

const emojiFromIndex = [
  '1️⃣',
  '2️⃣',
  '3️⃣',
  '4️⃣',
  '5️⃣',
  '6️⃣',
  '7️⃣',
  '8️⃣',
  '9️⃣',
  '🔟',
];

export class Movies {
  private file: FileStorage<MovieState>;

  // TODO(Aaron): take constructor for which movies to do
  // we want to allow different modes maybe?
  // allow for mode where users suggest a movie, possibly with a prompt
  // allow for different voting types (fptp, majority, rcv)
  constructor() {
    this.file = new FileStorage<MovieState>(
      `${__dirname}/../resources/halloween.json`
    );
  }

  public add(movie: string, userId: string) {
    this.file.set((state) => {
      if (
        !state.movies.findIndex(
          ({ name }) => name.toLowerCase() === movie.toLowerCase()
        )
      ) {
        state.movies.push({
          name: titleCase(movie),
          addedBy: userId,
          imdb: `https://www.imdb.com/find?q=${encodeURIComponent(movie)}`,
        });
      }
    });
  }

  public remove(movie: string) {
    this.file.set((state) => {
      state.movies = state.movies.filter(
        ({ name }) => name.toLowerCase() !== movie.toLowerCase()
      );
    });
  }

  public list(): MessageEmbed[] {
    const { movies } = this.file.get();
    const sep = '$$$$$';
    const nameSep = ' | ';
    let nsep = 1;
    const list = movies.sort(movieSort).reduce((acc, movie, index) => {
      const content = `[${movie.name}](${movie.imdb})`;
      if (acc.length + content.length > 4096 * nsep) {
        nsep++;
        acc = acc.slice(0, acc.lastIndexOf(nameSep)) + sep;
      }
      return acc + content + (index !== movies.length - 1 ? nameSep : '');
    }, '');
    return list
      .split(sep)
      .map((description) => new MessageEmbed({ description }));
  }

  public getRandomMovies(): Movie[] {
    const { attendees, movies } = this.file.get();
    const selected: Movie[] = [];
    while (selected.length < Object.keys(attendees).length) {
      const movie = movies[crypto.randomInt(movies.length)];
      if (!selected.find(({ name }) => name === movie.name)) {
        selected.push(movie);
      }
    }
    return selected.sort(movieSort);
  }

  public handleEmojiAdd(
    reaction: MessageReaction,
    channel: TextChannel,
    user: GuildMember
  ) {
    if (validChannelIds.includes(channel.id)) {
      this.file.set((state: MovieState) => {
        if (!state.attendees[user.id]) {
          if (MOVIE_TICKETS.includes(reaction.emoji.name as string)) {
            state.attendees[user.id] = [];
          }
          if (emojiFromIndex.includes(reaction.emoji.name as string)) {
            state.attendees[user.id] = [reaction.emoji.name as string];
          }
        } else {
          if (emojiFromIndex.includes(reaction.emoji.name as string)) {
            state.attendees[user.id].push(reaction.emoji.name as string);
          }
        }
        console.log(state.attendees);
      });
    }
  }

  public handleEmojiRemove(
    reaction: MessageReaction,
    channel: TextChannel,
    user: GuildMember
  ) {
    if (validChannelIds.includes(channel.id)) {
      this.file.set((state) => {
        if (state.attendees[user.id]) {
          if (MOVIE_TICKETS.includes(reaction.emoji.name as string)) {
            delete state.attendees[user.id];
          }
          if (emojiFromIndex.includes(reaction.emoji.name as string)) {
            state.attendees[user.id] = state.attendees[user.id]?.filter(
              (emoji) => reaction.emoji.name === emoji
            );
          }
          console.log(state.attendees);
        }
      });
    }
  }

  public async onCommand(
    message: Message,
    command: Command,
    args: Array<string>
  ) {
    if (validChannelIds.includes(message.channelId)) {
      await message.guild?.members.fetch();
      const { attendees } = this.file.get();
      switch (command) {
        case 'list': {
          message.reply({ embeds: this.list() });
          return;
        }
        case 'random': {
          if (!acceptableAuthors.includes(message.author.username)) break;
          const randomMovies = this.getRandomMovies();
          const movieList = randomMovies.reduce(
            (acc, movie, index) =>
              `${acc}${emojiFromIndex[index]} [${movie.name}](${movie.imdb})\n`,
            ''
          );
          const msg = {
            embeds: [new MessageEmbed({ description: movieList })],
          };
          const newMessage = await message.reply(
            movieList.length ? msg : 'Not enough attendees :shrug:'
          );
          try {
            await Promise.all(
              randomMovies.map((_, index) =>
                newMessage.react(emojiFromIndex[index])
              )
            );
          } catch (e) {
            console.log(e);
          }
          return;
        }
        case 'add': {
          const movie = args.join(' ');
          this.add(movie, message.author.id);
          message.reply(`added ${movie} to the movie list`);
          return;
        }
        case 'remove': {
          if (!acceptableAuthors.includes(message.author.username)) break;
          const movie = args.join(' ');
          this.remove(movie);
          message.reply(`removed ${movie} from the movie list`);
          return;
        }
        case 'weenies':
        case 'attendees': {
          message.reply(
            Object.keys(attendees)
              .map((id) => {
                const user = message.guild?.members.cache.get(id);
                return user?.nickname || user?.user.username || `<@${id}>`;
              })
              .join(', ') || 'none!'
          );
          return;
        }
        case 'vote': {
          const votes = args.join(' ').split(',');
          const movieList = votes.reduce(
            (acc, movie, index) =>
              `${acc}${
                emojiFromIndex[index]
              } [${movie}](https://www.imdb.com/find?q=${encodeURIComponent(
                movie
              )})\n`,
            ''
          );
          const msg = {
            embeds: [new MessageEmbed({ description: movieList })],
          };
          const newMessage = await message.reply(msg);
          try {
            await Promise.all(
              votes.map((_, index) => newMessage.react(emojiFromIndex[index]))
            );
          } catch (e) {
            console.log(e);
          }
          return;
        }
        case 'commands': {
          message.reply(commands);
          return;
        }
      }
      message.reply('boo!');
    }
  }
}
