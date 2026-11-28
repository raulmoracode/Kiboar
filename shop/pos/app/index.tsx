import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/Button";
import { CartButton } from "@/components/CartButton";
import { Screen } from "@/components/Screen";
import { useCart } from "@/lib/cart-context";
import { spacing } from "@/theme/tokens";

export default function Home() {
  const router = useRouter();
  const cart = useCart();

  return (
    <Screen>
      <View style={styles.top}>
        <CartButton count={cart.count} onPress={cart.openCart} />
      </View>

      <View style={styles.actions}>
        <Button label="Start sale" onPress={() => router.push("/catalogue")} />
        <Button label="Sales register" variant="ghost" onPress={() => router.push("/orders")} />
        <Button label="Settings" variant="ghost" onPress={() => router.push("/settings")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: "flex-end" },
  actions: { gap: spacing.md, marginTop: spacing.xl },
});
