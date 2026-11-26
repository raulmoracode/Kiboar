import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { MedusaAdminClient, type Sale, type SalesChannelKind } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { apiUrl } from "@/lib/config";
import { formatMoney } from "@/lib/format";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

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
      <Text style={styles.eyebrow}>Sales register</Text>
      <Text style={styles.title}>All sales</Text>

      {state.status === "signed_out" ? (
        <>
          <Text style={styles.body}>
            Sign in with an admin user to read the online and POS sales register.
          </Text>
          <Button label="Sign in" onPress={() => router.push("/login")} />
        </>
      ) : null}

      {state.status === "loading" ? <Text style={styles.body}>Loading the register…</Text> : null}

      {state.status === "error" ? (
        <>
          <Text style={styles.body}>The register cannot be reached right now.</Text>
          <Button label="Try again" onPress={() => setAttempt((value) => value + 1)} />
          <Button
            label="Sign in again"
            variant="ghost"
            onPress={() => {
              void signOut();
              router.push("/login");
            }}
          />
        </>
      ) : null}

      {state.status === "ready" && state.sales.length === 0 ? (
        <Text style={styles.body}>
          No sales recorded yet. Online and POS orders will appear here.
        </Text>
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
                <Text
                  style={[
                    styles.badge,
                    sale.channel === "pos" ? styles.badgePos : styles.badgeOther,
                  ]}
                >
                  {CHANNEL_LABEL[sale.channel]}
                </Text>
                {sale.channel === "pos" ? (
                  <Text style={styles.badge}>{PAYMENT_LABEL[sale.payment_method]}</Text>
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
  eyebrow: {
    color: colors.faint,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  title: { color: colors.text, fontFamily: fonts.sans, fontSize: 32, fontWeight: "500" },
  body: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  order: { color: colors.text, fontFamily: fonts.sans, fontSize: 15, fontWeight: "500" },
  total: { color: colors.text, fontFamily: fonts.mono, fontSize: 14 },
  meta: { color: colors.faint, fontFamily: fonts.sans, fontSize: 12 },
  tags: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.xs },
  badge: {
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    textTransform: "uppercase",
  },
  badgePos: { borderColor: colors.accent, color: colors.accent },
  badgeOther: { borderColor: colors.borderStrong, color: colors.muted },
});
