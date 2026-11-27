import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types";
import { Container, Heading, Text } from "@medusajs/ui";

const PAYMENT_LABEL: Record<string, string> = {
  cash: "Cash",
  link: "Payment link",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <Text size="small" className="text-ui-fg-subtle">
        {label}
      </Text>
      <Text size="small">{value}</Text>
    </div>
  );
}

const PosOrderWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const metadata = data.metadata ?? {};

  if (metadata.pos_sale !== true) {
    return null;
  }

  const method = typeof metadata.payment_method === "string" ? metadata.payment_method : null;
  const firstName = typeof metadata.buyer_first_name === "string" ? metadata.buyer_first_name : "";
  const lastName = typeof metadata.buyer_last_name === "string" ? metadata.buyer_last_name : "";
  const email = typeof metadata.buyer_email === "string" ? metadata.buyer_email : "";
  const name = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">POS sale</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Created at the till in the POS sales channel.
        </Text>
      </div>

      <div className="flex flex-col gap-2 px-6 py-4">
        <Row label="Payment method" value={(method && PAYMENT_LABEL[method]) ?? "Not recorded"} />
        {name ? <Row label="Customer" value={name} /> : null}
        {email ? <Row label="Email" value={email} /> : null}
        {method === "cash" ? (
          <Text size="small" className="text-ui-fg-subtle">
            In-person sale: no shipping address and no delivery.
          </Text>
        ) : null}
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({ zone: "order.details.after" });

export default PosOrderWidget;
