import { StyleSheet, Text } from "react-native";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { apiUrl, locationId, salesChannelId } from "@/lib/config";
import { colors, fonts } from "@/theme/tokens";

export default function Settings() {
  return (
    <Screen>
      <Text style={styles.eyebrow}>Settings</Text>
      <Text style={styles.title}>Till setup</Text>

      <Card>
        <Text style={styles.label}>Backend</Text>
        <Text style={styles.value}>{apiUrl}</Text>
        <Text style={styles.label}>POS sales channel</Text>
        <Text style={styles.value}>{salesChannelId ?? "not set"}</Text>
        <Text style={styles.label}>Stock location</Text>
        <Text style={styles.value}>{locationId ?? "not set"}</Text>
      </Card>

      <Text style={styles.body}>
        These values come from EXPO_PUBLIC_ variables. Secrets never go in the app; the Admin API
        credentials are entered by staff and stored in expo-secure-store.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.faint,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  title: { color: colors.text, fontFamily: fonts.sans, fontSize: 32, fontWeight: "500" },
  label: {
    color: colors.faint,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  value: { color: colors.text, fontFamily: fonts.mono, fontSize: 12, marginBottom: 8 },
  body: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 },
});
