import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/Button";
import { CartButton } from "@/components/CartButton";
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
        action={<CartButton count={cart.count} onPress={() => router.push("/cart")} />}
      />

      {state.status === "loading" ? <Text style={typography.body}>Loading…</Text> : null}

      {state.status === "error" ? (
        <View style={styles.stack}>
          <Text style={typography.small}>{state.message}</Text>
          <Button label="Try again" onPress={() => setAttempt((current) => current + 1)} />
        </View>
      ) : null}

      {state.status === "ready" && state.items.length === 0 ? (
        <Text style={typography.small}>No products in the POS channel.</Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  stack: { gap: spacing.md },
});
