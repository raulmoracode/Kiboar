import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { type CatalogueItem, imageUrl } from "@/lib/catalogue";
import { formatMoney } from "@/lib/format";
import { colors, radius, spacing, typography } from "@/theme/tokens";

export function ProductTile({ item, onAdd }: { item: CatalogueItem; onAdd: () => void }) {
  const photo = imageUrl(item.thumbnail);

  return (
    <Pressable
      accessibilityHint={item.soldOut ? undefined : "Adds one to the current sale"}
      accessibilityLabel={item.soldOut ? `${item.title} is sold out` : `Add ${item.title} to cart`}
      accessibilityRole="button"
      accessibilityState={{ disabled: item.soldOut }}
      disabled={item.soldOut}
      onPress={item.soldOut ? undefined : onAdd}
      style={({ pressed }) => [
        styles.tile,
        item.soldOut ? styles.soldOutTile : null,
        pressed && !item.soldOut ? styles.pressed : null,
      ]}
    >
      <View style={styles.media}>
        {photo ? (
          <Image
            accessibilityLabel={`${item.title} photo`}
            resizeMode="contain"
            source={{ uri: photo }}
            style={styles.photo}
          />
        ) : (
          <Text style={typography.eyebrow}>No photo</Text>
        )}
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{formatMoney(item.unitAmount, item.currency)}</Text>
          {item.soldOut ? (
            <Text style={styles.soldOut}>Sold out</Text>
          ) : (
            <View style={styles.add}>
              <Text style={styles.addLabel}>+</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexBasis: 200,
    flexGrow: 1,
    maxWidth: 360,
    overflow: "hidden",
  },
  pressed: { backgroundColor: colors.cardPressed, borderColor: colors.borderStrong },
  soldOutTile: { opacity: 0.55 },
  media: {
    alignItems: "center",
    aspectRatio: 4 / 3,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    justifyContent: "center",
    padding: spacing.md,
    width: "100%",
  },
  photo: { height: "100%", width: "100%" },
  body: { gap: spacing.sm, padding: spacing.md },
  title: {
    color: colors.text,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 19,
  },
  footer: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  price: { color: colors.text, fontFamily: typography.mono.fontFamily, fontSize: 13 },
  add: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  addLabel: { color: colors.accent, fontFamily: typography.mono.fontFamily, fontSize: 15 },
  soldOut: {
    color: colors.danger,
    fontFamily: typography.body.fontFamily,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
