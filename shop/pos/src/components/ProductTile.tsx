import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { type CatalogueItem, imageUrl } from "@/lib/catalogue";
import { formatMoney } from "@/lib/format";
import { colors, radius, spacing, typography } from "@/theme/tokens";

export function ProductTile({ item, onAdd }: { item: CatalogueItem; onAdd: () => void }) {
  const photo = imageUrl(item.thumbnail);

  return (
    <Pressable
      accessibilityHint="Adds one to the current sale"
      accessibilityLabel={`Add ${item.title} to cart`}
      accessibilityRole="button"
      onPress={onAdd}
      style={({ pressed }) => [styles.tile, pressed ? styles.pressed : null]}
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
          <View style={styles.add}>
            <Text style={styles.addLabel}>+</Text>
          </View>
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
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  addLabel: { color: colors.text, fontFamily: typography.mono.fontFamily, fontSize: 15 },
});
