import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing } from "@/theme/tokens";
import { Button } from "./Button";

export function QuantityStepper({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <View style={styles.row}>
      <Button
        accessibilityLabel="Decrease quantity"
        label="−"
        onPress={() => onChange(quantity - 1)}
        size="compact"
        variant="ghost"
      />
      <Text style={styles.quantity}>{quantity}</Text>
      <Button
        accessibilityLabel="Increase quantity"
        label="+"
        onPress={() => onChange(quantity + 1)}
        size="compact"
        variant="ghost"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  quantity: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 14,
    minWidth: 28,
    textAlign: "center",
  },
});
