import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Badge, Button, Container, Heading, Table, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";

import type { SaleRow, SalesChannelKind, SalesPaymentMethod } from "../../../lib/sales";
import { sdk } from "../../lib/sdk";

export const config = defineRouteConfig({ label: "Sales", rank: 60 });

const CHANNEL_LABEL: Record<SalesChannelKind, string> = {
  online: "Online",
  pos: "POS",
  other: "Other",
};

const CHANNEL_COLOR: Record<SalesChannelKind, "blue" | "green" | "grey"> = {
  online: "blue",
  pos: "green",
  other: "grey",
};

const PAYMENT_LABEL: Record<SalesPaymentMethod, string> = {
  stripe_link: "Stripe link",
  cash: "Cash",
  other: "—",
};

type State = { status: "loading" } | { status: "error" } | { status: "ready"; sales: SaleRow[] };

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatTotal(sale: SaleRow): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: sale.currency_code.toUpperCase() || "EUR",
  }).format(sale.total);
}

function SalesPage() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    sdk.client
      .fetch<{ sales: SaleRow[] }>("/admin/reports/sales?limit=100")
      .then((result) => {
        if (!cancelled) {
          setState({ status: "ready", sales: result.sales });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Sales</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Every online and POS order, with its channel and POS payment method.
          </Text>
        </div>
      </div>

      {state.status === "loading" ? (
        <div className="px-6 py-8">
          <Text>Loading the register…</Text>
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="flex flex-col items-start gap-3 px-6 py-8">
          <Text>The register cannot be reached right now.</Text>
          <Button size="small" variant="secondary" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </Button>
        </div>
      ) : null}

      {state.status === "ready" && state.sales.length === 0 ? (
        <div className="px-6 py-8">
          <Text>No sales recorded yet. Online and POS orders will appear here.</Text>
        </div>
      ) : null}

      {state.status === "ready" && state.sales.length > 0 ? (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Channel</Table.HeaderCell>
              <Table.HeaderCell>Payment</Table.HeaderCell>
              <Table.HeaderCell>Total</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {state.sales.map((sale) => (
              <Table.Row key={sale.id}>
                <Table.Cell>{formatDate(sale.created_at)}</Table.Cell>
                <Table.Cell>{sale.display_id ? `#${sale.display_id}` : sale.id}</Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <Badge color={CHANNEL_COLOR[sale.channel]}>{CHANNEL_LABEL[sale.channel]}</Badge>
                    <Text size="small">{sale.channel_name}</Text>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {sale.channel === "pos" ? PAYMENT_LABEL[sale.payment_method] : "—"}
                </Table.Cell>
                <Table.Cell>{formatTotal(sale)}</Table.Cell>
                <Table.Cell>{sale.status}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : null}
    </Container>
  );
}

export default SalesPage;
