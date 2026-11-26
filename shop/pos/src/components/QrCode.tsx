import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { colors, radius, spacing, typography } from "@/theme/tokens";

export function QrCode({ value }: { value: string | null }) {
  if (!value) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>QR pending.</Text>
      </View>
    );
  }

  return (
    <View style={styles.qr}>
      <QRCode value={value} size={220} backgroundColor="#ffffff" color={colors.background} />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "dashed",
    borderWidth: 1,
    height: 240,
    justifyContent: "center",
    padding: spacing.lg,
    width: 240,
  },
  placeholderText: {
    ...typography.small,
    maxWidth: 180,
    textAlign: "center",
  },
  qr: {
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
