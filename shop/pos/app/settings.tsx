import { StyleSheet, Text, View } from "react-native";

import { AppBar } from "@/components/AppBar";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/lib/auth-context";
import { apiUrl, locationId, salesChannelId } from "@/lib/config";
import { colors, fonts, typography } from "@/theme/tokens";

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={typography.eyebrow}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function Settings() {
  const { token } = useAuth();

  return (
    <Screen>
      <AppBar back backTo="/" />

      <Card>
        <SettingRow label="Backend" value={apiUrl} />
        <SettingRow label="POS sales channel" value={salesChannelId ?? "not set"} />
        <SettingRow label="Stock location" value={locationId ?? "not set"} />
        <SettingRow label="Session" value={token ? "Signed in" : "Signed out"} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { gap: 4 },
  value: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 12,
    marginBottom: 8,
  },
});
