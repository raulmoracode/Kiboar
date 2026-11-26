import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppBar } from "@/components/AppBar";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { MedusaAdminClient, type Sale, type SalesChannelKind } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { apiUrl } from "@/lib/config";
import { formatMoney } from "@/lib/format";
import { colors, fonts, spacing, typography } from "@/theme/tokens";

const CHANNEL_LABEL: Record<SalesChannelKind, string> = {
  online: "Online",
  pos: "POS",
  other: "Other",
};

const PAYMENT_LABEL = {
  stripe_link: "Stripe link",
  cash: "Cash",
  other: "—",
} as const;

type State =
  | { status: "signed_out" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; sales: Sale[] };

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function Orders() {
  const router = useRouter();
  const { token, ready, signOut } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!token) {
      setState({ status: "signed_out" });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    new MedusaAdminClient(apiUrl, token)
      .listSales()
      .then((sales) => {
        if (!cancelled) {
          setState({ status: "ready", sales });
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
  }, [ready, token, attempt]);

  return (
    <Screen>
      <AppBar back backTo="/" title="Sales register" />

      <PageHeader
        eyebrow="Sales register"
        subtitle="Online and POS orders, newest first."
        title="All sales"
      />

      {state.status === "signed_out" ? (
        <Card>
          <Text style={styles.cardTitle}>Staff sign-in required</Text>
          <Text style={typography.small}>
            Sign in with an admin user to read the online and POS sales register.
          </Text>
          <Button label="Sign in" onPress={() => router.push("/login")} />
        </Card>
      ) : null}

      {state.status === "loading" ? (
        <Text style={typography.body}>Loading the register…</Text>
      ) : null}

      {state.status === "error" ? (
        <Card>
          <Text style={styles.cardTitle}>The register cannot be reached</Text>
          <Text style={typography.small}>Check the backend and try again.</Text>
          <Button label="Try again" onPress={() => setAttempt((value) => value + 1)} />
          <Button
            label="Sign in again"
            variant="ghost"
            onPress={() => {
              void signOut();
              router.push("/login");
            }}
          />
        </Card>
      ) : null}

      {state.status === "ready" && state.sales.length === 0 ? (
        <Card>
          <Text style={styles.cardTitle}>No sales yet</Text>
          <Text style={typography.small}>
            Online and POS orders will appear here as soon as they are paid.
          </Text>
        </Card>
      ) : null}

      {state.status === "ready"
        ? state.sales.map((sale) => (
            <Card key={sale.id}>
              <View style={styles.row}>
                <Text style={styles.order}>
                  {sale.display_id ? `#${sale.display_id}` : sale.id}
                </Text>
                <Text style={styles.total}>{formatMoney(sale.total, sale.currency_code)}</Text>
              </View>
              <Text style={styles.meta}>
                {formatDate(sale.created_at)} · {sale.status}
              </Text>
              <View style={styles.tags}>
                <Badge
                  label={CHANNEL_LABEL[sale.channel]}
                  tone={sale.channel === "pos" ? "accent" : "neutral"}
                />
                {sale.channel === "pos" ? (
                  <Badge label={PAYMENT_LABEL[sale.payment_method]} />
                ) : null}
              </View>
            </Card>
          ))
        : null}

      <Button label="Back home" variant="ghost" onPress={() => router.push("/")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTitle: { ...typography.title, fontSize: 20, lineHeight: 26 },
  row: { alignItems: "baseline", flexDirection: "row", justifyContent: "space-between" },
  order: { color: colors.text, fontFamily: fonts.sans, fontSize: 15, fontWeight: "500" },
  total: { color: colors.text, fontFamily: fonts.mono, fontSize: 14 },
  meta: { color: colors.faint, fontFamily: fonts.sans, fontSize: 12 },
  tags: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.xs },
});
