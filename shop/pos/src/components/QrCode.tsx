import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { colors, fonts, radius, spacing } from "@/theme/tokens";

export function QrCode({ value }: { value: string | null }) {
  if (!value) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          The payment QR appears here once the backend returns it.
        </Text>
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
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "dashed",
    borderWidth: 1,
    height: 220,
    justifyContent: "center",
    padding: spacing.md,
    width: 220,
  },
  placeholderText: {
    color: colors.faint,
    fontFamily: fonts.sans,
    fontSize: 12,
    textAlign: "center",
  },
  qr: { alignSelf: "center", backgroundColor: "#ffffff", padding: spacing.md },
});
