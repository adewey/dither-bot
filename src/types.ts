import type { GuildEmoji, ReactionEmoji } from 'discord.js';

export type MovieState = {
  attendees: Attendees;
  movies: Array<Movie>;
};

export type Attendees = {
  [id: string]: Array<string>;
};

export type Movie = {
  name: string;
  addedBy: string;
  imdb: string;
};
