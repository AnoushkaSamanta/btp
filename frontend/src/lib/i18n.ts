import en from '../locales/en.json';
import hi from '../locales/hi.json';
import bho from '../locales/bho.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';

const dictionaries: Record<string, Record<string, string>> = {
  English: en,
  Hindi: hi,
  Bhojpuri: bho,
  Tamil: ta,
  Telugu: te,
  en,
  hi,
  bho,
  ta,
  te,
};

export function t(key: string, lang = 'English'): string {
  const dict = dictionaries[lang] || dictionaries['English'] || en;
  return dict[key] || (en as Record<string, string>)[key] || key;
}
