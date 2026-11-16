import { navigate } from 'astro:transitions/client';
import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/astro';
import { i18nProvider } from 'fumadocs-ui/i18n';
import SearchDialog from '@/components/search';
import { translations } from '@/lib/layout.shared';

export interface ProviderProps {
  lang: string;
  pathname: string;
  params: Record<string, string | undefined>;
  children?: ReactNode;
}

export function Provider({ lang, pathname, params, children }: ProviderProps) {
  return (
    <RootProvider
      pathname={pathname}
      params={params}
      navigate={navigate}
      i18n={i18nProvider(translations, lang)}
      search={{ SearchDialog }}
    >
      {children}
    </RootProvider>
  );
}

export function ContentProvider({ lang, pathname, params, children }: ProviderProps) {
  return (
    <RootProvider
      pathname={pathname}
      params={params}
      navigate={navigate}
      i18n={i18nProvider(translations, lang)}
      theme={{ enabled: false }}
      search={{ enabled: false }}
    >
      {children}
    </RootProvider>
  );
}
