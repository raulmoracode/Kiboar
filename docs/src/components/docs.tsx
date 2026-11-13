import { type SerializedPageTree, useFumadocsLoader } from 'fumadocs-core/source/client';
import type { TOCItemType } from 'fumadocs-core/toc';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { Provider, type ProviderProps } from '@/components/provider';
import { baseOptions } from '@/lib/layout.shared';

export interface DocsProps extends ProviderProps {
  tree: SerializedPageTree;
  title: string;
  description?: string;
  hideTitle?: boolean;
  toc: TOCItemType[];
}

export function Docs({ tree, title, description, hideTitle, toc, children, ...props }: DocsProps) {
  const data = useFumadocsLoader({ tree });

  return (
    <Provider {...props}>
      <DocsLayout {...baseOptions(props.lang)} tree={data.tree}>
        <DocsPage toc={toc}>
          {hideTitle ? <h1 className="sr-only">{title}</h1> : <DocsTitle>{title}</DocsTitle>}
          <DocsDescription>{description}</DocsDescription>
          {children}
        </DocsPage>
      </DocsLayout>
    </Provider>
  );
}
