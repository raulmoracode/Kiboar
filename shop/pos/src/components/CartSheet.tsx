import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  BackHandler,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { Button } from "@/components/Button";
import { QuantityStepper } from "@/components/QuantityStepper";
import { useCart } from "@/lib/cart-context";
import { imageUrl } from "@/lib/catalogue";
import { formatMoney } from "@/lib/format";
import { colors, fonts, radius, spacing, typography } from "@/theme/tokens";

function CloseIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth={1.5} />
    </Svg>
  );
}

function TrashIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7M6.5 7l.8 11.2A2 2 0 0 0 9.3 20h5.4a2 2 0 0 0 2-1.8L17.5 7M10 11v5M14 11v5"
        stroke={colors.danger}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.4}
      />
    </Svg>
  );
}

export function CartSheet() {
  const router = useRouter();
  const cart = useCart();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 640;
  const progress = useRef(new Animated.Value(1)).current;
  // The tap that opens the panel can also reach the backdrop once it mounts.
  // Keep the backdrop inert until the entrance animation has finished.
  const canCloseFromBackdrop = useRef(false);
  const animatedForOpen = useRef(false);

  const { isOpen, closeCart } = cart;

  useEffect(() => {
    if (!isOpen) {
      // Leave the value at the closed position so the next open renders
      // off-screen before the entrance starts; otherwise the panel flashes
      // open for a frame and then slides in again.
      progress.setValue(1);
      animatedForOpen.current = false;
      return;
    }

    // Guard against a second effect run (StrictMode / dev) restarting the
    // entrance and looking like the panel closes and reopens.
    if (animatedForOpen.current) {
      return;
    }
    animatedForOpen.current = true;

    canCloseFromBackdrop.current = false;
    progress.setValue(1);
    Animated.timing(progress, {
      toValue: 0,
      duration: 240,
      useNativeDriver: Platform.OS !== "web",
    }).start(({ finished }) => {
      if (finished) {
        canCloseFromBackdrop.current = true;
      }
    });
  }, [isOpen, progress]);

  useEffect(() => {
    // react-native-web has no hardware back button and warns if asked for one.
    if (!isOpen || Platform.OS === "web") {
      return;
    }

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      closeCart();
      return true;
    });
    return () => subscription.remove();
  }, [isOpen, closeCart]);

  useEffect(() => {
    if (!isOpen || Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeCart]);

  if (!isOpen) {
    return null;
  }

  const currency = cart.lines[0]?.currency ?? "EUR";
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 440] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 900] });

  function startSale() {
    closeCart();
    router.push("/catalogue");
  }

  function takePayment() {
    closeCart();
    router.push("/payment");
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable
        accessibilityLabel="Close the cart"
        accessibilityRole="button"
        onPress={() => {
          if (canCloseFromBackdrop.current) {
            closeCart();
          }
        }}
        style={styles.backdrop}
      />

      <Animated.View
        accessibilityViewIsModal
        style={[
          styles.panel,
          wide ? styles.sidePanel : styles.bottomPanel,
          {
            paddingBottom: wide ? spacing.lg : insets.bottom + spacing.lg,
            transform: wide ? [{ translateX }] : [{ translateY }],
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text style={styles.title}>Cart</Text>
            {cart.count > 0 ? <Text style={styles.count}>{cart.count}</Text> : null}
            <Pressable
              accessibilityLabel="Close the cart"
              accessibilityRole="button"
              hitSlop={8}
              onPress={closeCart}
              style={({ pressed }) => [styles.close, pressed ? styles.pressed : null]}
            >
              <CloseIcon />
            </Pressable>
          </View>
        </View>

        {cart.lines.length === 0 ? (
          <View style={styles.empty}>
            <Text style={typography.body}>Cart is empty.</Text>
            <Button label="Start sale" onPress={startSale} />
          </View>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.lines}>
              {cart.lines.map((line) => {
                const photo = imageUrl(line.thumbnail ?? null);

                return (
                  <View key={line.id} style={styles.line}>
                    {photo ? (
                      <View style={styles.thumb}>
                        <Image
                          accessibilityLabel={`${line.title} photo`}
                          resizeMode="contain"
                          source={{ uri: photo }}
                          style={styles.photo}
                        />
                      </View>
                    ) : (
                      <View style={[styles.thumb, styles.thumbEmpty]}>
                        <Text style={styles.noPhoto}>No photo</Text>
                      </View>
                    )}

                    <View style={styles.info}>
                      <Text numberOfLines={1} style={styles.product}>
                        {line.title}
                      </Text>
                      <Text style={styles.unit}>
                        {formatMoney(line.unitAmount, line.currency)} each
                      </Text>
                      <QuantityStepper
                        quantity={line.quantity}
                        onChange={(quantity) => cart.setQuantity(line.id, quantity)}
                      />
                    </View>

                    <View style={styles.end}>
                      <Text style={styles.lineTotal}>
                        {formatMoney(line.unitAmount * line.quantity, line.currency)}
                      </Text>
                      <Pressable
                        accessibilityLabel={`Remove ${line.title} from the cart`}
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={() => cart.setQuantity(line.id, 0)}
                        style={({ pressed }) => [styles.remove, pressed ? styles.pressed : null]}
                      >
                        <TrashIcon />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={typography.eyebrow}>Total</Text>
                <Text style={styles.total}>{formatMoney(cart.total, currency)}</Text>
              </View>
              <Button label="Take payment" onPress={takePayment} />
              <Button label="Clear cart" variant="danger" onPress={cart.clear} />
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  panel: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    position: "absolute",
  },
  bottomPanel: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    maxHeight: "85%",
    paddingHorizontal: spacing.lg,
    right: 0,
  },
  sidePanel: {
    borderLeftWidth: 1,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    right: 0,
    top: 0,
    width: 420,
    maxWidth: "100%",
  },
  header: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  heading: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  title: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: 16,
    fontWeight: "600",
  },
  count: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  close: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  pressed: { opacity: 0.7 },
  empty: {
    alignItems: "center",
    flexGrow: 1,
    gap: spacing.lg,
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  lines: { gap: spacing.md, paddingVertical: spacing.md },
  line: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  thumb: {
    backgroundColor: colors.elevated,
    borderRadius: radius.sm,
    height: 56,
    padding: spacing.xs,
    width: 70,
  },
  thumbEmpty: { alignItems: "center", justifyContent: "center" },
  photo: { height: "100%", width: "100%" },
  noPhoto: {
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: 8,
    textTransform: "uppercase",
  },
  info: { flex: 1, gap: spacing.xs },
  product: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "500",
  },
  unit: { color: colors.muted, fontFamily: fonts.mono, fontSize: 11 },
  end: { alignItems: "flex-end", gap: spacing.sm },
  lineTotal: { color: colors.text, fontFamily: fonts.mono, fontSize: 13 },
  remove: { alignItems: "center", height: 28, justifyContent: "center", width: 28 },
  footer: { gap: spacing.md, paddingTop: spacing.md },
  totalRow: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  total: { color: colors.text, fontFamily: fonts.mono, fontSize: 18 },
});
