import type { Movie } from './types';

export const removeArticles = (str: string): string => {
  let words = str.split(' ');
  if (words.length <= 1) return str;
  if (words[0] == 'a' || words[0] == 'the' || words[0] == 'an')
    return words.splice(1).join(' ');
  return str;
};

export const titleSort = (a: string, b: string) => {
  const aTitle = removeArticles(a.toLowerCase());
  const bTitle = removeArticles(b.toLowerCase());
  return aTitle > bTitle ? 1 : aTitle < bTitle ? -1 : 0;
};

export const movieSort = (a: Movie, b: Movie) => {
  const aTitle = removeArticles(a.name.toLowerCase());
  const bTitle = removeArticles(b.name.toLowerCase());
  return aTitle > bTitle ? 1 : aTitle < bTitle ? -1 : 0;
};

export const titleCase = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.replace(word[0], word[0].toUpperCase()))
    .join(' ');
