import { i18nProvider } from 'fumadocs-ui/i18n';
import { uiTranslations } from 'fumadocs-ui/i18n';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { i18n } from '@/lib/i18n';
import { appName, gitConfig } from './shared';

export const translations = i18n.translations().extend(uiTranslations());

export function baseOptions(locale: string): BaseLayoutProps {
  return {
    nav: {
      title: appName,
      url: locale === i18n.defaultLanguage ? '/' : `/${locale}`,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}

export { i18nProvider };
