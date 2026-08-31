import { ar } from './ar';
import { en } from './en';
import { Language } from '../types';

export const translations = {
  ar,
  en,
};

export type Translations = typeof ar;

export function getTranslation(lang: Language): Translations {
  return translations[lang] || translations.ar;
}
