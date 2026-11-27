import { Button, Text } from "@medusajs/ui";
import { type ChangeEvent, useRef, useState } from "react";
import { z } from "zod";

import { sdk } from "../lib/sdk";

type ProductWithMetadata = {
  metadata?: Record<string, unknown> | null;
};

type FirmwareUploadProps = {
  value?: string;
  onChange: (value: string) => void;
};

const FIRMWARE_EXTENSIONS = ["bin", "hex", "uf2", "zip"];
const FIRMWARE_MAX_BYTES = 32 * 1024 * 1024;

// The helper is not exported by @medusajs/admin-sdk 2.23 yet. The admin build
// reads the call statically, so a local identity helper is enough.
function unstable_defineCustomFieldsConfig<T>(config: T): T {
  return config;
}

function FirmwareUpload({ value, onChange }: FirmwareUploadProps) {
  const filePicker = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !FIRMWARE_EXTENSIONS.includes(extension)) {
      setError("Choose a .bin, .hex, .uf2 or .zip file.");
      return;
    }

    if (file.size > FIRMWARE_MAX_BYTES) {
      setError("The firmware file must be 32 MB or smaller.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const { files } = await sdk.admin.upload.create({ files: [file] });
      const uploaded = files[0];
      if (!uploaded?.id) {
        throw new Error("The upload did not return a file id.");
      }
      onChange(`/static/${uploaded.id}`);
    } catch {
      setError("The firmware file could not be uploaded.");
    } finally {
      setBusy(false);
    }
  };

  const fileName = value?.split("/").pop()?.replace(/^\d+-/, "");

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={filePicker}
        type="file"
        accept=".bin,.hex,.uf2,.zip"
        className="sr-only"
        onChange={onFile}
        aria-label="Official firmware file"
        disabled={busy}
      />

      {value ? (
        <div className="flex flex-wrap items-center gap-2">
          <Text size="small" className="text-ui-fg-subtle">
            {fileName || "Firmware uploaded"}
          </Text>
          <Button
            type="button"
            size="small"
            variant="secondary"
            isLoading={busy}
            onClick={() => filePicker.current?.click()}
          >
            Replace file
          </Button>
          <Button
            type="button"
            size="small"
            variant="transparent"
            disabled={busy}
            onClick={() => onChange("")}
          >
            Remove
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="small"
          variant="secondary"
          isLoading={busy}
          onClick={() => filePicker.current?.click()}
        >
          Upload firmware
        </Button>
      )}

      {error ? (
        <Text size="small" role="alert" className="text-ui-fg-error">
          {error}
        </Text>
      ) : null}

      <Text size="small" className="text-ui-fg-muted">
        .bin, .hex, .uf2 or .zip, up to 32 MB. Save the product after uploading.
      </Text>
    </div>
  );
}

export default unstable_defineCustomFieldsConfig({
  model: "product",
  // The values live in product metadata, persisted by the workflow hook, so
  // there is no linked model to fetch. The build still requires the property.
  link: [],
  forms: [
    {
      zone: "edit",
      fields: {
        keyboard_files_url: {
          label: "Keyboard files URL",
          description: "GitHub link shown below Add to bag on the storefront.",
          placeholder: "https://github.com/raulmoracode/Kiboar/tree/main/software/boards/kb60-hhkb",
          validation: z.string().optional(),
          defaultValue: (product: ProductWithMetadata) => {
            const value = product.metadata?.keyboard_files_url;
            return typeof value === "string" ? value : "";
          },
        },
        firmware_url: {
          label: "Official firmware",
          description: "Upload the firmware file customers can download.",
          validation: z.string().optional(),
          defaultValue: (product: ProductWithMetadata) => {
            const value = product.metadata?.firmware_url;
            return typeof value === "string" ? value : "";
          },
          component: FirmwareUpload,
        },
      },
    },
  ],
});
