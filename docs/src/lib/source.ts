import { getCollection } from "astro:content";
import { toFumadocsSource } from "@fumadocs/astro/source";
import { loader } from "fumadocs-core/source";
import { i18n } from "./i18n";
import { docsRoute } from "./shared";

export const source = loader({
  source: toFumadocsSource(await getCollection("docs"), await getCollection("meta")),
  baseUrl: docsRoute,
  i18n,
});
