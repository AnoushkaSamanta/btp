import en from '../locales/en.json';
import hi from '../locales/hi.json';
import bho from '../locales/bho.json';

const dictionaries: Record<string, Record<string, string>> = {
  English: en,
  Hindi: hi,
  Bhojpuri: bho,
  Tamil: en,
  Telugu: en,
};

export function t(key: string, lang = 'English'): string {
  const dict = dictionaries[lang] || dictionaries['English'];
  return dict[key] || (en as Record<string, string>)[key] || key;
}
