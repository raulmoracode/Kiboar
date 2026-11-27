import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Button, Container, Heading, Input, Label, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";

import { sdk } from "../lib/sdk";

const KEY = "keyboard_files_url";

type ProductWidgetData = {
  id: string;
  metadata?: Record<string, unknown> | null;
};

type Message = { tone: "error" | "success"; text: string };

function isGithubUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const isGithub = url.hostname === "github.com" || url.hostname === "www.github.com";
    return url.protocol === "https:" && isGithub;
  } catch {
    return false;
  }
}

function KeyboardFilesWidget({ data }: { data?: ProductWidgetData }) {
  const [url, setUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!data?.id) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setMessage(null);

    sdk.admin.product
      .retrieve(data.id, { fields: "id,metadata" })
      .then(({ product }) => {
        if (cancelled) {
          return;
        }

        const loaded = product.metadata ?? {};
        const value = loaded[KEY];
        const current = typeof value === "string" ? value : "";
        setMetadata(loaded);
        setUrl(current);
        setSavedUrl(current);
      })
      .catch(() => {
        if (!cancelled) {
          setMessage({ tone: "error", text: "The current link could not be loaded." });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [data?.id]);

  if (!data?.id) {
    return null;
  }

  const save = async () => {
    if (!metadata) {
      return;
    }

    const next = url.trim();
    if (next && !isGithubUrl(next)) {
      setMessage({ tone: "error", text: "Use an https://github.com/... URL." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const nextMetadata = { ...metadata, [KEY]: next };
      await sdk.admin.product.update(data.id, { metadata: nextMetadata });
      setMetadata(nextMetadata);
      setUrl(next);
      setSavedUrl(next);
      setMessage({
        tone: "success",
        text: next ? "Link saved." : "Link cleared; the storefront button is hidden.",
      });
    } catch {
      setMessage({ tone: "error", text: "The link could not be saved." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Keyboard files</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          The storefront shows this as a button under Add to bag.
        </Text>
      </div>

      {loading ? (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            Loading the current link…
          </Text>
        </div>
      ) : (
        <form
          className="flex flex-col gap-3 px-6 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="keyboard-files-url" size="small">
              GitHub URL
            </Label>
            <Input
              id="keyboard-files-url"
              name="keyboard-files-url"
              type="url"
              size="small"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://github.com/raulmoracode/Kiboar/tree/main/software/boards/kb60-hhkb"
              disabled={saving || !metadata}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              size="small"
              isLoading={saving}
              disabled={saving || !metadata || url.trim() === savedUrl}
            >
              Save link
            </Button>
            {message ? (
              <Text
                size="small"
                role={message.tone === "error" ? "alert" : "status"}
                className={message.tone === "error" ? "text-ui-fg-error" : "text-ui-fg-subtle"}
              >
                {message.text}
              </Text>
            ) : null}
          </div>

          <Text size="small" className="text-ui-fg-muted">
            Leave it empty to hide the button. Only https://github.com links are accepted.
          </Text>
        </form>
      )}
    </Container>
  );
}

export const config = defineWidgetConfig({ zone: "product.details.side.after" });

export default KeyboardFilesWidget;
