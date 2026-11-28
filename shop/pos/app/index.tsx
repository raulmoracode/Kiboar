import { useRouter } from "expo-router";
import { Linking, StyleSheet, View } from "react-native";

import { Button } from "@/components/Button";
import { CartButton } from "@/components/CartButton";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { apiUrl } from "@/lib/config";
import { spacing } from "@/theme/tokens";

export default function Home() {
  const router = useRouter();
  const cart = useCart();
  const { signOut } = useAuth();

  return (
    <Screen>
      <View style={styles.top}>
        <CartButton count={cart.count} onPress={() => router.push("/cart")} />
      </View>

      <View style={styles.actions}>
        <Button label="Start sale" onPress={() => router.push("/catalogue")} />
        <Button
          label="Medusa admin"
          variant="ghost"
          onPress={() => void Linking.openURL(`${apiUrl}/app`)}
        />
        <Button label="Settings" variant="ghost" onPress={() => router.push("/settings")} />
        <Button label="Sign out" variant="danger" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: "flex-end" },
  actions: { gap: spacing.md, marginTop: spacing.xl },
});
