import { type SerializedPageTree, useFumadocsLoader } from "fumadocs-core/source/client";
import type { TOCItemType } from "fumadocs-core/toc";
import { DocsLayout } from "fumadocs-ui/layouts/spacious";
import { DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/spacious/page";
import { HeaderActions } from "fumadocs-ui/layouts/spacious/slots/actions";
import { ShoppingCart } from "lucide-react";
import type { ComponentProps } from "react";
import { Provider, type ProviderProps } from "@/components/provider";
import { baseOptions } from "@/lib/layout.shared";
import { gitConfig } from "@/lib/shared";

const repositoryUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

/** GitHub mark: lucide no longer ships brand icons. */
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/** Spacious' actions plus the shop (label on desktop) and repository icon links. */
function ActionsWithShop({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      <a
        href="/shop"
        aria-label="Shop"
        className="hidden h-7.5 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-fd-muted-foreground transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground lg:inline-flex"
      >
        <ShoppingCart className="size-4" />
        Shop
      </a>
      <a
        href="/shop"
        aria-label="Shop"
        className="inline-flex size-7.5 items-center justify-center rounded-md text-fd-muted-foreground transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground lg:hidden"
      >
        <ShoppingCart className="size-4.5" />
      </a>
      <a
        href={repositoryUrl}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Repository"
        className="inline-flex size-7.5 items-center justify-center rounded-md text-fd-muted-foreground transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground"
      >
        <GitHubMark className="size-4.5" />
      </a>
      <HeaderActions {...props} />
    </div>
  );
}

export interface DocsProps extends ProviderProps {
  tree: SerializedPageTree;
  title: string;
  description?: string;
  hideTitle?: boolean;
  /** Keep the description for metadata but not repeat it above the page body. */
  hideDescription?: boolean;
  /** Use the full page width for wide tables and grids. */
  full?: boolean;
  /** Extra classes for the page article, e.g. to scope page-specific styles. */
  className?: string;
  toc: TOCItemType[];
}

export function Docs({
  tree,
  title,
  description,
  hideTitle,
  hideDescription,
  full,
  toc,
  className,
  children,
  ...props
}: DocsProps) {
  const data = useFumadocsLoader({ tree });

  return (
    <Provider {...props}>
      <DocsLayout
        {...baseOptions(props.lang)}
        tree={data.tree}
        sidebar={{ defaultOpenLevel: 1 }}
        slots={{ actions: ActionsWithShop }}
      >
        <DocsPage full={full} toc={toc} tableOfContent={{ enabled: true }} className={className}>
          {hideTitle ? <h1 className="sr-only">{title}</h1> : <DocsTitle>{title}</DocsTitle>}
          {!hideDescription && <DocsDescription>{description}</DocsDescription>}
          {children}
        </DocsPage>
      </DocsLayout>
    </Provider>
  );
}
