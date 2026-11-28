import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CartSheet } from "@/components/CartSheet";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { resolveAuthRedirect } from "@/lib/auth-routing";
import { CartProvider } from "@/lib/cart-context";
import { colors } from "@/theme/tokens";

function AuthGate() {
  const { token, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const destination = resolveAuthRedirect({ ready, hasToken: Boolean(token), pathname });

  useEffect(() => {
    if (destination === "login") {
      router.replace("/login");
    } else if (destination === "home") {
      router.replace("/");
    }
  }, [destination, router]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGate />
        <CartProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
          <CartSheet />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
