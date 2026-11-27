import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Heading, Input, Label, Text, toast } from "@medusajs/ui";
import { type ChangeEvent, type FormEvent, useId, useState } from "react";

import { sdk } from "../lib/sdk";

const MAX_LENGTH = 60;

type SpecField = "mcu" | "case" | "keys" | "layout";

type SpecValues = Record<SpecField, string>;

type SpecErrors = Partial<Record<SpecField, string>>;

const SPEC_LABELS: Record<SpecField, string> = {
  mcu: "MCU",
  case: "Case",
  keys: "Keys",
  layout: "Layout",
};

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readSpecs(metadata: Record<string, unknown> | null | undefined): SpecValues {
  const keys = metadata?.keys;
  return {
    mcu: toText(metadata?.mcu),
    case: toText(metadata?.case),
    keys: typeof keys === "number" ? String(keys) : toText(keys),
    layout: toText(metadata?.layout),
  };
}

function trimSpecs(values: SpecValues): SpecValues {
  return {
    mcu: values.mcu.trim(),
    case: values.case.trim(),
    keys: values.keys.trim(),
    layout: values.layout.trim(),
  };
}

function validate(values: SpecValues): SpecErrors {
  const errors: SpecErrors = {};

  for (const field of ["mcu", "case", "layout"] as const) {
    if (values[field].trim().length > MAX_LENGTH) {
      errors[field] = `${SPEC_LABELS[field]} must be ${MAX_LENGTH} characters or fewer.`;
    }
  }

  const keys = values.keys.trim();
  if (keys !== "") {
    const parsed = Number(keys);
    if (!/^\d+$/.test(keys) || !Number.isSafeInteger(parsed) || parsed <= 0) {
      errors.keys = "Keys must be a whole number greater than 0, or left empty.";
    }
  }

  return errors;
}

function buildMetadata(
  current: Record<string, unknown> | null | undefined,
  values: SpecValues,
): Record<string, unknown> {
  const metadata: Record<string, unknown> = { ...(current ?? {}) };
  const trimmed = trimSpecs(values);

  for (const field of ["mcu", "case", "layout"] as const) {
    if (trimmed[field]) {
      metadata[field] = trimmed[field];
    } else {
      delete metadata[field];
    }
  }

  if (trimmed.keys) {
    metadata.keys = Number(trimmed.keys);
  } else {
    delete metadata.keys;
  }

  return metadata;
}

type ProductSpecsFormProps = {
  productId: string;
  metadata: Record<string, unknown> | null | undefined;
};

function ProductSpecsForm({ productId, metadata }: ProductSpecsFormProps) {
  const idPrefix = useId();
  const [values, setValues] = useState<SpecValues>(() => readSpecs(metadata));
  const [errors, setErrors] = useState<SpecErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const bindField = (field: SpecField) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) {
      return;
    }

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await sdk.admin.product.update(productId, {
        metadata: buildMetadata(metadata, values),
      });
      setValues((current) => trimSpecs(current));
      toast.success("Specifications saved");
    } catch {
      setFormError("The specifications could not be saved. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Specifications</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Shown on the storefront product page. Leave a field empty to hide it.
        </Text>
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 px-6 py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(["mcu", "case", "keys", "layout"] as const).map((field) => {
            const inputId = `${idPrefix}-${field}`;
            const errorId = `${inputId}-error`;
            const error = errors[field];

            return (
              <div key={field} className="flex flex-col gap-1">
                <Label htmlFor={inputId} size="small">
                  {SPEC_LABELS[field]}
                </Label>
                <Input
                  id={inputId}
                  value={values[field]}
                  onChange={bindField(field)}
                  inputMode={field === "keys" ? "numeric" : undefined}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                />
                {error ? (
                  <Text id={errorId} size="small" role="alert" className="text-ui-fg-error">
                    {error}
                  </Text>
                ) : null}
              </div>
            );
          })}
        </div>

        {formError ? (
          <Text size="small" role="alert" className="text-ui-fg-error">
            {formError}
          </Text>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" isLoading={saving} disabled={saving}>
            Save
          </Button>
        </div>
      </form>
    </Container>
  );
}

const ProductSpecsWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const specs = readSpecs(data.metadata);
  const syncKey = [data.id, specs.mcu, specs.case, specs.keys, specs.layout].join("\u0000");

  // Remount when the product's stored values change so the form never shows
  // stale data, without resetting fields while the user is typing.
  return <ProductSpecsForm key={syncKey} productId={data.id} metadata={data.metadata} />;
};

export const config = defineWidgetConfig({ zone: "product.details.after" });

export default ProductSpecsWidget;
