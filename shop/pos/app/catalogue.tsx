import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { CartButton } from "@/components/CartButton";
import { PageHeader } from "@/components/PageHeader";
import { ProductTile } from "@/components/ProductTile";
import { Screen } from "@/components/Screen";
import { useCart } from "@/lib/cart-context";
import { type CatalogueItem, imageUrl, listCatalogue, NotConfiguredError } from "@/lib/catalogue";
import { spacing, typography } from "@/theme/tokens";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: CatalogueItem[] };

export default function Catalogue() {
  const router = useRouter();
  const cart = useCart();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    listCatalogue()
      .then((items) => {
        if (!cancelled) {
          setState({ status: "ready", items });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof NotConfiguredError
                ? error.message
                : "The catalogue cannot be reached right now.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return (
    <Screen>
      <AppBar
        back
        backTo="/"
        title="Catalogue"
        action={<CartButton count={cart.count} onPress={() => router.push("/cart")} />}
      />

      <PageHeader
        eyebrow="Catalogue"
        subtitle="Tap a board to add it to the current sale."
        title="Boards"
      />

      {state.status === "loading" ? (
        <Text style={typography.body}>Loading the catalogue…</Text>
      ) : null}

      {state.status === "error" ? (
        <Card>
          <Text style={typography.small}>{state.message}</Text>
          <Button label="Try again" onPress={() => setAttempt((current) => current + 1)} />
          <Button label="Back home" variant="ghost" onPress={() => router.push("/")} />
        </Card>
      ) : null}

      {state.status === "ready" && state.items.length === 0 ? (
        <Card>
          <Text style={typography.small}>
            The POS sales channel has no published products yet. Run the shop seed and check the
            channel in Medusa.
          </Text>
        </Card>
      ) : null}

      {state.status === "ready" && state.items.length > 0 ? (
        <View style={styles.grid}>
          {state.items.map((item) => (
            <ProductTile
              key={item.variantId}
              item={item}
              onAdd={() =>
                cart.add({
                  id: item.variantId,
                  title: item.title,
                  unitAmount: item.unitAmount,
                  currency: item.currency,
                  thumbnail: imageUrl(item.thumbnail),
                })
              }
            />
          ))}
        </View>
      ) : null}

      {cart.count > 0 ? (
        <Button
          label={`Open cart (${cart.count})`}
          variant="ghost"
          onPress={() => router.push("/cart")}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
});
